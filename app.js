// Before the game start
// - Listen for any keyboard action
// - Start the game

// After the game start
// - Jump dino when a space key is pressed
// - Listen forcollision between dino and cactus
// - If there is collision, make the game end
// - If there is no collision, update the score and generate obstacle


// Game ends (Game over)

let RootElem = document.querySelector(":root")
let GameElem = document.querySelector("#game")
let DinoElem = GameElem.querySelector(".dino")
let ScoreElem = GameElem.querySelector(".score")
let GroundElem = GameElem.querySelector(".ground")
let CactusElem = GroundElem.querySelector(".cactus")

let GameSpeed = 4000
let JumpSpeed = (GameSpeed / 10) * 2
let MaxJump = 250
let SpeedScale = 1

let Score = 0
let GameStarted = false
let GameOver = false

let Jumping = false
let SelfPlayMode = false

//RootElem, "--game-speed", GameSpeed
function setCustomProperty(elem, prop, value){
    elem.style.setProperty(prop,value)
}

function handleJump(e){
    if(e.code !== "Space")return
    let audio = document.querySelector(".audio-jump")
    audio.play()
    Jumping = true
    DinoElem.classList.add("jump")
    DinoElem.addEventListener('animationend', function(){
        Jumping = false
        DinoElem.classList.remove("jump")
    })
}

function shouldJump(){
    let minGap = 230
    let cactusXPos = CactusElem.getBoundingClientRect().x
    
    if(cactusXPos <= 0 || Jumping) return false
    if(cactusXPos < minGap){
        return true
    }
    return false
}

// let GameID
function startGame(){
    GameStarted = true
    GameElem.classList.add("game-started")
    document.addEventListener('keydown', handleJump)
    // GameID = setInterval(() => {
    //     updateGame()
    // }, 100);
    window.requestAnimationFrame(updateGame)
}

function endGame(){
    let audio = document.querySelector(".audio-die")
    audio.play()
    GameOver = true
    GameElem.classList.add("game-over")
    document.removeEventListener('keydown', handleJump)
    // clearInterval(GameID)
}

// As long as the game is running, this function is called
function updateGame(){
    setCustomProperty(RootElem, "--game-speed", GameSpeed)
    setCustomProperty(RootElem, "--jump-speed", JumpSpeed)
    setCustomProperty(RootElem, "--max-jump", MaxJump)
    setCustomProperty(RootElem, "--speed-scale", SpeedScale)
    if (SelfPlayMode){
        if(shouldJump()){
            handleJump({code: "Space"})
        }
    }

    //update the score
    updateScore()
    // update the cactus
    updateCactus()
    // check if game over
    if (checkGameOver()){
        endGame()
        return
    }
    window.requestAnimationFrame(updateGame)
}

function isCollision(dinoRect, cactusRect){
    // AABB - Axis-aligned bounding box
    return(
        dinoRect.x < cactusRect.x + cactusRect.width &&
        dinoRect.x + dinoRect.width > cactusRect.x &&
        dinoRect.y < cactusRect.y + cactusRect.height &&
        dinoRect.y + dinoRect.height > cactusRect.y
    )
}

function checkGameOver(){
    if(GameOver)return true
    let dinoRect = DinoElem.getBoundingClientRect()
    let cactusRect = CactusElem.getBoundingClientRect()
    if(isCollision(dinoRect, cactusRect)){
        return true
    }
    return false
}

let scoreInterval = 10
let currentScoreInterval = 0
function updateScore(){
    currentScoreInterval += 1
    if(currentScoreInterval % scoreInterval !== 0){
        return
    }
    Score += 1
    if(Score === 0) return
    if(Score % 100 === 0){
        let audio = document.querySelector(".audio-point")
        audio.play()
        GameSpeed -= SpeedScale
        JumpSpeed = (GameSpeed/ 10) * 2
    }

    let currentScoreElem = ScoreElem.querySelector(".current-score")
    currentScoreElem.innerText = Score.toString().padStart(5,"0")
}

function updateCactus(){
    let cactusXPos = CactusElem.getBoundingClientRect().x
    let isOffScreen = cactusXPos > window.innerWidth
    if (isOffScreen === false)return

    let cacti = ["cactus-small-1","cactus-small-2","cactus-small-3"]
    let randomNum = Math.floor(Math.random() * cacti.length)
    let cactus = cacti[randomNum]
    CactusElem.classList.remove(
        "cactus-small1",
        "cactus-small-2",
        "cactus-small-3"
    )
    CactusElem.classList.add(cactus)
}

function fitScreen(){
    let width = window.innerWidth
    let height = window.innerHeight / 2
    GameElem.style.width = width + "px"
    GameElem.style.height = height + "px"
    GameElem.style.zoom = 1.5
}

window.addEventListener('load', function(){
    fitScreen()

    let selfPlayElem = document.querySelector("#selfplay")
    selfPlayElem.addEventListener('change', function(){
        SelfPlayMode = selfPlayElem.checked
    })
    window.addEventListener('resize', fitScreen)
    document.addEventListener('keydown', startGame, {once: true})
})