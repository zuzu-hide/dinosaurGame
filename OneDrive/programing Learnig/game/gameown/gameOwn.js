const gameSpace = document.getElementById("gameSpace");
const player = document.getElementById("player");
const enemy = document.querySelectorAll("[data-enemy]");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const overlay = document.getElementById("overlay");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const keys = {};

let gameRunning = false;
let enemyInterval = null;
let scoreInterval = null;
let score = 0;
let enemySpeed = 4;
let pressStartTime = 0;

class GameController {
    constructor() {
        startBtn.addEventListener("click", () => this.startGame());
        restartBtn.addEventListener("click", () => this.startGame());
    }
    startGame() {
        startBtn.classList.remove("active");
        restartBtn.classList.remove("active");
        overlay.classList.remove("active");

        score = 0;
        enemySpeed = 4;
        scoreEl.textContent = score;
        gameRunning = true;
        enemyControl.enemySpawn();
        this.gameLoop();
        scoreManage.scoreCounter();
    }

    gameOver() {
        gameRunning = false;
        clearTimeout(enemyInterval);
        clearInterval(scoreInterval);
        enemy.forEach(e => e.classList.remove("move"));
        scoreManage.saveScore();
        this.restart();
    }

    gameLoop() {
        if (!gameRunning) return;

        this.checkCollision();
        requestAnimationFrame(() => this.gameLoop());
    }

    restart() {
        restartBtn.classList.add("active");
        overlay.classList.add("active");

        if(!gameRunning) {
            gameRunning = false;
        }
    }

    checkCollision() {
        const p = player.getBoundingClientRect();
        
        enemy.forEach(e => {
            if (!e.classList.contains("move")) return;

            const hostile = e.getBoundingClientRect();
            if (p.right > hostile.left + 10 && 
                p.left < hostile.right - 10 &&
                p.bottom > hostile.top + 10 &&
                p.top < hostile.bottom
            ) {
                this.gameOver();
            }
        })
    }
}
const game = new GameController();

class ScoreManager {
    constructor() {
        this.highScore = this.loadScore();
        this.updateDisplay();
    }

    scoreCounter() {
        if (scoreInterval) clearInterval(scoreInterval);
        scoreInterval = setInterval(() => {
            score++;
            scoreEl.textContent = score;

            if (score % 100 === 0) {
                if (enemySpeed >= 3) {
                    enemySpeed -= 0.3;
                } else if (enemySpeed >= 1.8) {
                    enemySpeed -= 0.2;
                } else if (enemySpeed < 1.8) {
                    enemySpeed -= 0.1;
                } 
                console.log("speed:", enemySpeed);
            }
            if (enemySpeed <= 1.0) enemySpeed = 1.0;
        }, 150)    
    }

    loadScore() {
        const saved = localStorage.getItem("highScore");
        return saved ? JSON.parse(saved) : 0;
    }

    saveScore() {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem("highScore", this.highScore);
        }
        this.updateDisplay();
    }

    updateDisplay() {
        highScoreEl.textContent = `HI: ${this.highScore}`
    }
    
}
const scoreManage = new ScoreManager();

class PlayerController {
    playerOperate() {

        document.addEventListener("keydown", (event) => {
            if (event.code === "Space") event.preventDefault();
            if (startBtn.classList.contains("active")) return;
            if (!gameRunning) return;
            if ((event.code === "Space" || event.code === "ArrowUp") && !player.classList.contains("jump") && !player.classList.contains("highjump")) {
                pressStartTime = Date.now();
            };

            if (event.code === "ArrowDown") {    
                keys.down = true;        
                player.classList.add("squat");
            };

            if ((event.code === "ArrowLeft" || event.code === "ArrowRight") && !player.classList.contains("slender")) {
                keys.down = true;        
                player.classList.add("slender");
                console.log("pushされました")
            }
        });

        document.addEventListener("keyup", (event) => {
            if (startBtn.classList.contains("active")) return;
            if (!gameRunning) return;
            if ((event.code === "Space" || event.code === "ArrowUp") && !player.classList.contains("jump") && !player.classList.contains("highjump")) {
                const pressTime = Date.now() - pressStartTime;

                this.jump(pressTime);
            };

            if (event.code === "ArrowDown") {
                keys.up = false;
                player.classList.remove("squat");
            };

            if ((event.code === "ArrowLeft" || event.code === "ArrowRight") && player.classList.contains("slender")) {
                keys.down = false;        
                player.classList.remove("slender");
                console.log("pullされました")
            }
        });

        
    }

    jump(pressTime) { 
        player.classList.remove("jump", "highjump");
        if (pressTime < 55) {
            player.classList.add("jump");

            player.addEventListener("animationend", () => {
                player.classList.remove("jump");
            }, {once: true});
        } else if(pressTime >= 55) {
            player.classList.add("highjump");
            player.addEventListener("animationend", () => {
                player.classList.remove("highjump");
            }, {once: true});
        }
    }
}
const playerControl = new PlayerController();
playerControl.playerOperate();

class EnemyController {
    enemySpawn() {
        if (!gameRunning) return;

        //moveのついてる敵は画面上に二体まで
        const movingEnemy = [...enemy].filter(e => e.classList.contains("move"));
        if (movingEnemy.length >= 3) {
            enemyInterval = setTimeout(() => this.enemySpawn(), 500);
            return;
        }
        
        //moveがついていない要素だけ出現
        const available = [...enemy].filter(e => !e.classList.contains("move"));
        if (available.length === 0) return;

        //ランダムに要素(htmlのdomから)選ぶ
        const randomEnemy = available[Math.floor(Math.random() * available.length)];



        //アニメーションの速度をスコアによって変更
        randomEnemy.style.animationDuration = enemySpeed + "s";

        this.activateEnemy(randomEnemy);
    }

    enemySpawnFrequency() {
        const min = 950;
        const max = 1900;
        return Math.random() * ( max - min ) + min;
    }

    activateEnemy(el) {
        el.classList.remove("move");
        void el.offsetWidth;
        el.classList.add("move");

        el.addEventListener("animationend", () => {
            el.classList.remove("move"); // moveクラスを外す
        }, { once: true }); 

        const time = this.enemySpawnFrequency();
        enemyInterval = setTimeout(() => this.enemySpawn(), time);       
    }
}
const enemyControl = new EnemyController();



