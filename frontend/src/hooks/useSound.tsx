import opening from "@/assets/sounds/drums_of_liberation.mp3"



export const useSound = () => {


    const playSound = (title:string) => {
        let soundSrc:string;

        switch(title){
            case "opening":
                soundSrc = opening;
                break;
            default:
                soundSrc = opening;
        }

        const audio = new Audio(soundSrc)
        audio.volume = 0.6;
        audio.currentTime = 0;
        audio.play().catch(()=>{
            // autoplay might be blocked
        });
    };

    return playSound;

};