import { sendNotification } from "@tauri-apps/api/notification";


export const sendAlert = ({title, body, sound, soundFile}:{
    title: string,
    body: string,
    sound: boolean,
    soundFile?: string,
}) => {
    if(sound) {
        sendNotification({
            title,
            body,
            sound: soundFile ? soundFile : 'default'
        })
    } else {
        sendNotification({
            title,
            body,
        })
    }
}