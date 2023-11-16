import { useEffect, useState } from "react";
import "./App.css";
import { pomodoroStages } from "./utils/pomodoroStages";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, useDisclosure } from "@nextui-org/react";
import { BiCog, BiPause, BiPlay, BiFastForward, BiMoon, BiSun, BiAlarm } from 'react-icons/bi'
import { useTheme } from "next-themes";
import { themes } from "./utils/themes";
import { TbBrain, TbCoffee } from "react-icons/tb";
import { sendAlert } from "./utils/tauri";

function App() {

  const [focusTime, setFocusTime] = useState(25)
  const [shortBreakTime, setShortBreakTime] = useState(5)
  const [longBreakTime, setLongBreakTime] = useState(15)
  const [currentMinutes, setCurrentMinutes] = useState(focusTime)
  const [currentSeconds, setCurrentSeconds] = useState(0)
  const [currentStage, setCurrentStage] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [autoStart, setAutoStart] = useState(true)
  const [currentTheme, setCurrentTheme] = useState('red')
  const {theme, setTheme} = useTheme()
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [soundActive, setSoundActive] = useState(true)

  // useEffect that change between stages and reset timers
  useEffect( () => {
    if(currentStage < pomodoroStages.length){

      !autoStart && setIsRunning(false)

      if(pomodoroStages[currentStage] === 'Focus'){
        setCurrentTheme('red')
        setCurrentMinutes(focusTime)
        setCurrentSeconds(0)
      } 
      else if (pomodoroStages[currentStage] === 'Short Break'){
        setCurrentTheme('green')
        setCurrentMinutes(shortBreakTime)
        setCurrentSeconds(0)
      } else {
        setCurrentTheme('blue')
        setCurrentMinutes(longBreakTime)
        setCurrentSeconds(0)
      }
    } 
  }, [currentStage, focusTime, shortBreakTime, longBreakTime, autoStart])

  function resetPomodoro(){
    setIsRunning(false)
    setCurrentStage(0)
  }

  // useEffect that update the time ever second.
  useEffect( () => {
    if(isRunning) {
      let interval = setInterval( () => {
        if(currentSeconds > 0) setCurrentSeconds(currentSeconds - 1)
        else if(currentMinutes > 0){
          setCurrentMinutes(currentMinutes - 1)
          setCurrentSeconds(59)
        } else {
          if(currentStage === pomodoroStages.length - 1){
            resetPomodoro()
            sendAlert({
              title: "Felicitaciones 😍",
              body: "Has completado tu sesión de pomodoro!!",
              sound: soundActive
            })
          } else {
            if (pomodoroStages[currentStage] === "Focus") {
              sendAlert({
                title: "Felicitaciones 😍",
                body: "Has completado tu sesión de concentración, te toca descansar!!",
                sound: soundActive
              })
            } else if (pomodoroStages[currentStage] === "Short Break") {
              sendAlert({
                title: "Vamos de nuevo!! 😱",
                body: "se ha acabado el descanso, recupera energías y vamos seguimos con todo!!!",
                sound: soundActive
              })
            } else {
              sendAlert({
                title: "Felicitaciones!! 😱",
                body: "Has avanzado muchisimoo!, se ha terminado tu sesión, eres genial!!",
                sound: soundActive
              })
            }
            setCurrentStage(currentStage + 1)
          }
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  })

  return (
    <>
      <Modal
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Configuraciones</ModalHeader>
              <ModalBody>
              <Switch
                isSelected={theme === 'dark'}
                size="lg"
                color="success"
                onChange={()=>{setTheme(theme === 'light' ? 'dark' : 'light')}}
                thumbIcon={({ isSelected, className }) =>
                  isSelected ? (
                    <BiSun className={className} />
                  ) : (
                    <BiMoon className={className} />
                  )
                }
              >
                Modo oscuro
              </Switch>
              <Switch
                isSelected={autoStart}
                size="lg"
                color="success"
                onChange={()=>{setAutoStart(!autoStart)}}
              >
                Comenzar automáticamente
              </Switch>
              <Switch
                isSelected={soundActive}
                size="lg"
                color="success"
                onChange={()=>{setSoundActive(!autoStart)}}
              >
                Sonido
              </Switch>
              <p>Tiempos:</p>
              <div className="flex flex-row gap-3">
                <Input
                  type="number"
                  label="Focus"
                  placeholder="25"
                  value={focusTime.toString()}
                  labelPlacement="outside"
                  startContent={ <BiAlarm />}
                  isRequired
                  onChange={(e)=>{parseInt(e.target.value) && setFocusTime(parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value))}}
                  />
                <Input
                  type="number"
                  label="Soft Brake"
                  value={shortBreakTime.toString()}
                  placeholder="25"
                  labelPlacement="outside"
                  startContent={ <BiAlarm />}
                  isRequired
                  onChange={(e)=>{parseInt(e.target.value) && setShortBreakTime(parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value))}}
                  />
                <Input
                  type="number"
                  label="Long brake"
                  placeholder="25"
                  value={longBreakTime.toString()}
                  labelPlacement="outside"
                  startContent={ <BiAlarm />}
                  isRequired
                  onChange={(e)=>{parseInt(e.target.value) && setLongBreakTime(parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value))}}
                />

              </div>
              </ModalBody>
              <ModalFooter>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={`${themes[theme!].bg[currentTheme]} w-screen h-screen leading-none font-roboto `}>

        <div className='grid place-content-center w-full h-full'>

          <div className='flex flex-col'>
            <Chip className={"mx-auto"} classNames={{
                base: `${themes[theme!].border[currentTheme]} ${themes[theme!].focusBg[currentTheme]} border-small shadow-pink-500/30`,
                content: `drop-shadow shadow-black ${themes[theme!].text[currentTheme]}`,
              }} 
              variant="flat" size="lg" startContent={ pomodoroStages[currentStage] === 'Focus' ? <TbBrain className='text-2xl self-center' /> : <TbCoffee className='text-2xl self-center' /> }>{pomodoroStages[currentStage]}</Chip>
            <div className={`${themes[theme!].text[currentTheme]} flex flex-col text-center text-[240px]`}>
              <h1 className={`${isRunning ? 'font-bold' : 'font-thin'}`}>{currentMinutes > 9 ? currentMinutes : '0' + currentMinutes}</h1>
              <h1 className={`${isRunning ? 'font-bold' : 'font-thin'}`}>{currentSeconds > 9 ? currentSeconds : '0' + currentSeconds}</h1>
            </div>

            <div className='flex flex-row gap-4 mt-6 mx-auto items-center'>
              <Button className={`${themes[theme!].button.specialBg[currentTheme]} rounded-full text-3xl ${themes[theme!].button.text[currentTheme]}`} size="lg" isIconOnly variant="light" color={false} onClick={()=>{onOpen()}}><BiCog/></Button>
              <Button className={`${themes[theme!].button.specialBg[currentTheme]} rounded-full text-[70px] h-[70px] w-[100px] ${themes[theme!].button.text[currentTheme]}`} isIconOnly variant="light" color={false} onClick={()=>{setIsRunning(!isRunning)}}>{isRunning ? <BiPause/> : <BiPlay/>}</Button>
              <Button className={`${themes[theme!].button.specialBg[currentTheme]} rounded-full text-3xl ${themes[theme!].button.text[currentTheme]}`} size="lg" isIconOnly variant="light" color={false} onClick={()=>{currentStage === pomodoroStages.length - 1 ? setCurrentStage(0) : setCurrentStage(currentStage + 1)}}><BiFastForward/></Button>
            </div>

          </div>

        </div>
      </div>
    </>
  )
}

export default App;
