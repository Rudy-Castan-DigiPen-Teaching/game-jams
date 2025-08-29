var BackgroundMusic;
var StartSounds = [];
var HurtSounds  = [];
var ControlsSound;
var PlayedControlsSounds = false;
var EatItemSounds        = [];
var WinSound;

function PreLoadSounds()
{
    BackgroundMusic = loadSound("audio/background.ogg");
    StartSounds     = [
        loadSound("audio/lets_go_01.ogg"),
        loadSound("audio/lets_go_02.ogg"),
        loadSound("audio/thankyou_for_playing.ogg"),
    ];

    HurtSounds = [
        loadSound("audio/omg.ogg"),
        loadSound("audio/ouch_01.ogg"),
        loadSound("audio/ouch_02.ogg"),
        loadSound("audio/ouch_03.ogg"),
        loadSound("audio/ouch_04.ogg"),
        loadSound("audio/you_lost_01.ogg"),
        loadSound("audio/you_lost_02.ogg"),
    ];

    ControlsSound = loadSound("audio/use_arrow_keys.ogg");

    EatItemSounds = [
        loadSound("audio/yum_01.ogg"),
        loadSound("audio/yum_02.ogg"),
        loadSound("audio/yum_03.ogg"),
        loadSound("audio/yum_04.ogg"),
        loadSound("audio/yum_05.ogg"),
    ];

    WinSound = loadSound("audio/you_won_01.ogg");
}

function StartBackgroundMusic()
{
    BackgroundMusic.setVolume(0.5);
    if (!BackgroundMusic.isPlaying())
    {
        BackgroundMusic.play();
        BackgroundMusic.loop();
    }
}

function StopBackgroundMusic()
{
    BackgroundMusic.stop();
}

function PlayControlsSound()
{
    if (!PlayedControlsSounds)
    {
        setTimeout(() => { ControlsSound.play(); }, 3000);
        PlayedControlsSounds = true;
    }
}

function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function PlayStartSound()
{
    const sfx = this.StartSounds[Math.floor(Math.random() * this.StartSounds.length)];
    setTimeout(() => { sfx.play(); }, getRandomInt(1000, 2000));
}

function PlayHurtSound()
{
    const sfx = this.HurtSounds[Math.floor(Math.random() * this.HurtSounds.length)];
    sfx.play();
}

function PlayEatSound()
{
    const sfx = this.EatItemSounds[Math.floor(Math.random() * this.EatItemSounds.length)];
    sfx.play();
}

function PlayWinSound()
{
    WinSound.play();
}
