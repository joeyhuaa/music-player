import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { PlayArrow, Pause } from '@mui/icons-material'

//todo - include TS typing and documentation

function MusicPlayer() {
  const music = useRef(null)
  const timeline = useRef(null)
  const timelinePast = useRef(null)
  const pButton = useRef(null)

  const [currSong, setCurrSong] = useState(null)
  const [currentTime, setCurrentTime] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [songDuration, setSongDuration] = useState(null)

  useEffect(() => {
    async function getSong() {
      try {
        const res = await fetch('/api/song')
        const data  = await res?.json()
        console.log(data)
        setCurrSong(data)
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }
    getSong()
  }, [])

  // can we get song duration in state before pressing play?
  useEffect(() => {
    if (music?.current?.src) {
      setSongDuration(music.current.duration)
    }
  }), [music]

  useEffect(() => {
    if (isPlaying) {
      music.current.play()  
    } else {
      music.current.pause()
    }
  }, [isPlaying])

  let playPause = () => setIsPlaying(!isPlaying)

  let getCurrentTime = () => { return music?.current?.currentTime }

  let getDuration = () => { return music?.current?.duration }

  let getTimeLineWidth = () => timeline?.current?.offsetWidth

  //todo
  // let queueNextSong = () => {
  //     let nextSong = songs[Math.floor(Math.random() * songs.length)]
  //     if (nextSong.id === currSong.id) queueNextSong()
  //     else setCurrSong(nextSong)
  //     console.log('queued ' + nextSong.name)
  // }

  let timeUpdate = () => {
    // update the timeline UI
    let playPercent = (music.current.currentTime / getDuration()) * getTimeLineWidth()
    timelinePast.current.style.width = playPercent + 'px'

    // set state
    setCurrentTime( msString(getCurrentTime()) )
    if ( getCurrentTime() === getDuration() ) {
      setIsPlaying(false)
      // queueNextSong() //todo
    }
  }

  let timeLineClicked = (e) => {
    let timelineLeft = timeline.current.getBoundingClientRect().left
    let clickPercent = (e.clientX - timelineLeft) / getTimeLineWidth()
    music.current.currentTime = getDuration() * clickPercent
    setCurrentTime(msString(getCurrentTime()))
  }

  let msString = (seconds) => {
    let t = moment.duration(seconds * 1000);
    let m = t.minutes()
    let s = t.seconds() < 10 ? '0' + t.seconds() : t.seconds();
    if (Number.isNaN(m) || Number.isNaN(s)) return null;
    else return `${m}:${s}`
  };

  return (
    <Container id='player_container'>
      <audio
        id='music'
        ref={music}
        onTimeUpdate={timeUpdate}
        src={currSong ? currSong.url : null}
      />

      <SongTitle>
        {currSong ? currSong.name : null}
      </SongTitle>

      <PButton ref={pButton} onClick={() => playPause()}>
        {isPlaying ? (
          <Pause />
        ) : (
          <PlayArrow />
        )}
      </PButton>

      <Timestamp>
        {currentTime || `-:--`}
      </Timestamp>

      <Timeline ref={timeline} onClick={e => timeLineClicked(e)}>
        <TimelinePast ref={timelinePast} />
      </Timeline>

      <Timestamp>
        {msString(getDuration()) || `-:--`}
      </Timestamp>
    </Container>
  )
}

const Container = styled.section`
  background-color: #0f0f0f;
  height: 10vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  flex: 100%;
  align-self: flex-end;
  margin: -20px;
  position: fixed;
  bottom: 20px;
`
const SongTitle = styled.span`
  font-size: 12px;
  font-weight: bold;
  margin-left: 1em;
`
const PButton = styled.div`
  width: 20px;
  height: 20px;
  margin-left: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:focus { outline: none; }
  &:hover { cursor: pointer; }
`
const Timestamp = styled.span`
  font-size: 12px;
  width: 30px;
  text-align: center;
`
const Timeline = styled.div`
  width: 400px;
  height: 5px;
  margin: 0 5px;
  background: #353535;
  border-radius: 15px;
  display: flex;
  align-items: center;
  position: relative;
  &:hover { cursor: pointer; }
`
const TimelinePast = styled.div`
  height: 5px;
  background: white;
  border-radius: 15px;
`

export default MusicPlayer;

