window.addEventListener('load', function(){
    
    //variaveis de tela
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    if(document.body.clientWidth > 1400){
        canvas.width = 1500;
        canvas.height = 750;
    }
    else{
        canvas.width = 1100;
        canvas.height = 550;
    }
    
    const backgroundLayer1 = document.getElementById('grondImg');
    const backgroundLayer2 = document.getElementById('background');
    const btnStart = document.querySelector('.startGame');
    const btnLoja = document.querySelector('.Lojinha');
    const btnReinicia = document.querySelector('.reiniciar');
    const btnVolta = document.querySelector('.voltaTela');

    
    //variaveis globais
    let enemies = [];
    let seconds = 0, minutes = 0, score = 0, tempo = '00 : 00';
    
    let gameSpeed = 3;
    let gameOver = false;

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 4000;
    let randomEnemyInterval = Math.random() * enemyInterval + 500; 
    let enemySpeed = 7;
    
    let sonicFrameY = 0;
    let sonicframeTimer = -5;
    let sonicBall = false;

    let scoreIntervalTime = 250;
    let scoreCheck = false;
    let startScreen = true;

    class InputHandler {
        constructor(){
            this.keys = [];
            window.addEventListener('keydown', e => {
                if((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Control' ||
                    e.key === 's' || e.key === 'w' || e.key === 'a' || e.key === 'd' || e.key === ' ') 
                    && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Control' ||
                    e.key === 's' || e.key === 'w' || e.key === 'a' || e.key === 'd' || e.key === ' ')){
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 150;
            this.height = 150;
            if(this.gameWidth === 1500) this.y = (this.gameHeight - 140) - this.height ;
            else this.y = (this.gameHeight - 105) - this.height;
            this.x = 0;
            this.image = document.getElementById('sonicImg');
            this.frameX = 0;
            this.frameY = sonicFrameY;
            this.maxFrame = 7;
            
            this.vy = 0;
            this.weight = 1;
            this.speed = 0;

            this.fps = 20;
            this.frameTimer = sonicframeTimer;
            this.frameInterval = 1000/this.fps;

        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(input, deltaTime, enemies){
            //colision check enemy 
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/3.7) - (this.x + this.width/2.3);
                const dy = (enemy.y + enemy.height/1.4) - (this.y + this.height/1.8);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < enemy.width/3.7 + this.width/2.3){
                    gameOver = true;
                }
            });

            //frame animation
            if(this.frameTimer > this.frameInterval){
                if((this.frameX >= this.maxFrame)) this.frameX = 0;
                if(!this.onGround() && this.frameX > 5) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = sonicframeTimer;
            } else {
                this.frameTimer += deltaTime;
            }
            
            //controls
            if(input.keys.indexOf('ArrowRight') > -1 ){
                this.speed = 5;
            }
            else if(input.keys.indexOf('ArrowLeft') > -1){
                this.speed = -8;
            }
            else if(input.keys.indexOf('ArrowUp') > -1 && this.onGround()){
                this.vy -= 22;
                sonicBall = false;
            }
            else if(input.keys.indexOf('ArrowDown') > -1 ){
                sonicBall = true;
                sonicFrameY = 5;
                if (gameSpeed > 13) sonicFrameY = 4;
                this.weight += 4;
            }
            else if(input.keys.indexOf('Control') > -1 ){
                sonicBall = false;
            }
            else if(input.keys.indexOf(' ') > -1 && this.onGround()){
                this.vy -= 22;
                sonicBall = false;
            }
            else if(input.keys.indexOf('d') > -1 ){
                this.speed = 5;
            }
            else if(input.keys.indexOf('a') > -1){
                this.speed = -8;
            }
            else if(input.keys.indexOf('w') > -1 && this.onGround()){
                this.vy -= 22;
                sonicBall = false;
            }
            else if(input.keys.indexOf('s') > -1 ){
                sonicBall = true;
                sonicFrameY = 5;
                if (gameSpeed > 13) sonicFrameY = 4;
                this.weight += 4;
            }
            else{
                this.speed = 0;
            }

            //horizontal moviment
            this.x += this.speed;
            if(this.x < 0) this.x = 0;
            else if ( this.x > this.gameWidth - this.width ) this.x = this.gameWidth - this.width;
            //vertical moviment
            this.y += this.vy;
            if(!this.onGround()){
                this.vy += this.weight;
                this.frameY = 1;
                this.maxFrame = 5;
                this.frameInterval = 2500/this.fps;
            }
            else{
                this.vy = 0;
                this.weight = 1;
                this.frameInterval = 1000/this.fps;

                if(this.gameWidth === 1500){
                    if(this.y != (this.gameHeight - 140) - this.height){
                        this.y = (this.gameHeight - 140) - this.height
                    };
                }
                else{
                    if(this.y != (this.gameHeight - 105) - this.height){
                        this.y = (this.gameHeight - 105) - this.height
                    };
                }
               

                this.frameY = sonicFrameY; 
                if(gameSpeed > 3 && gameSpeed < 8) sonicframeTimer = 15;

                if(gameSpeed < 8){
                    if(sonicBall) {
                        sonicFrameY = 5;
                        this.maxFrame = 5;
                    }
                    else{
                        sonicFrameY = 0;
                        this.maxFrame = 7;
                    }
                }
        
                else if(gameSpeed >= 8 && gameSpeed < 13){
                    if(sonicBall) {
                        sonicFrameY = 5;
                        this.maxFrame = 5;
                    }
                    else{
                        sonicFrameY = 2;
                        this.maxFrame = 7;
                    }
                    sonicframeTimer = 45;
                }
                else if(gameSpeed >= 13){
                    if(sonicBall){
                        sonicFrameY = 4;
                        this.maxFrame = 7;
                    } 
                    else{
                        sonicFrameY = 3;
                        this.maxFrame = 5;
                    } 
                    sonicframeTimer = 50;
                }
                    
            }
        }
        onGround(){
            if(this.gameWidth === 1500) return this.y >= (this.gameHeight - 140) - this.height;
            else return this.y >= (this.gameHeight - 105) - this.height;
        }
        
    }
    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 220;
            this.height = 120;
            this.image = document.getElementById('enemyImg');
            this.x = this.gameWidth;

            if(this.gameWidth === 1500) this.y = (this.gameHeight - 140) - this.height ;
            else this.y = (this.gameHeight - 105) - this.height;

            this.frameX = 0;
            this.maxFrame = 3;
            this.fps = 20;
            this.frameTimer = 0;

            this.frameInterval = 1000/this.fps;
            this.speed = enemySpeed;

            this.markedforDelete = false;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime){
            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            }else{
              this.frameTimer += deltaTime;  
            }
            
            this.x -= this.speed;
            if(this.x < 0 - this.width){
                this.markedforDelete = true;
                score += 10;
            } 
        }
    }
    class Background {
        constructor(gameWidth, gameHeight, image, speedModifier){
            this.x = 0;
            this.y = 0;
            this.width = gameWidth;
            this.height = gameHeight;
            this.x2 = this.width;
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * this.speedModifier;
        }
        update(){
            this.speed = gameSpeed * this.speedModifier;
            if(this.x <= -this.width){
                this.x = this.width + this.x2 - this.speed;
            }
            if(this.x2 <= -this.width){
                this.x2 = this.width + this.x - this.speed;
            }
            this.x = Math.floor(this.x - this.speed);
            this.x2 = Math.floor(this.x2 - this.speed);

        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x2, this.y, this.width, this.height);
        }
    }

    class StartScreen {
        constructor(gameWidth, gameHeight){
            this.y = 40;
            this.width = 650;
            this.height = 350;
            this.x = gameWidth/2 - this.width/2;
            this.image = document.getElementById('titlescreen');
        }
        update(){
            btnStart.addEventListener('click', () => {
                startScreen = false;
                btnStart.classList.add('hide');
                btnLoja.classList.add('hide');

            })
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    function handleEnemies(deltaTime) {
        if(enemyTimer > enemyInterval + randomEnemyInterval){
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });

        enemies = enemies.filter(enemy => !enemy.markedforDelete)
    }

    function zeroEsquerda(numero, comprimento) {
        numero = numero.toString();
        while (numero.length < comprimento)
            numero = "0" + numero;
        return numero;
    }

    function timeGenerator() {
        seconds += 1;

        if (seconds >= 60) {
            minutes += 1;
            seconds = 0;
        }

        let secondsValue = seconds < 10 ? '0'+seconds : seconds;
        let minutesValue = minutes < 10 ? '0'+ minutes : minutes;
        tempo =  minutesValue + ' : ' + secondsValue;
    }

    function gameSpeedManager(){
        
        if(!gameOver && !startScreen){
            gameSpeed += 0.01;
            enemySpeed += 0.02;
            enemyInterval -= 2;
            randomEnemyInterval = Math.random() * enemyInterval; 

            if (gameSpeed >= 18) gameSpeed = 18;
            if (enemySpeed >= 30) enemySpeed = 30;
            if (enemyInterval < 800) enemyInterval = 800; 

            
            if(gameSpeed > 5 && gameSpeed < 8 && scoreIntervalTime === 250 && !scoreCheck) {
                clearInterval(scoreInterval);
                scoreIntervalTime = 200;
                scoreInterval = setInterval(scoreGenerator, scoreIntervalTime);
                scoreCheck = true;
            }
            else if(gameSpeed >= 8 && gameSpeed < 11 && scoreIntervalTime === 200 && scoreCheck){
                clearInterval(scoreInterval);
                scoreIntervalTime = 150;
                scoreInterval = setInterval(scoreGenerator, scoreIntervalTime);
                scoreCheck = false;
            }
            else if(gameSpeed >= 11 && gameSpeed < 14 && scoreIntervalTime === 150 && !scoreCheck){
                clearInterval(scoreInterval);
                scoreIntervalTime = 100;
                scoreInterval = setInterval(scoreGenerator, scoreIntervalTime);
                scoreCheck = true;
            }
            else if(gameSpeed >= 14 && gameSpeed < 18 && scoreIntervalTime === 100 && scoreCheck){
                clearInterval(scoreInterval);
                scoreIntervalTime = 50;
                scoreInterval = setInterval(scoreGenerator, scoreIntervalTime);
                scoreCheck = false;
            }
            else if(gameSpeed >= 18 && scoreIntervalTime === 50 && !scoreCheck){
                clearInterval(scoreInterval);
                scoreIntervalTime = 10;
                scoreInterval = setInterval(scoreGenerator, scoreIntervalTime);
            }
  
            
        }
    }   

    const scoreGenerator = () => score++;

    function displayStatusText(context) {

        

        if(gameOver){
            btnReinicia.classList.remove('hide');
            btnVolta.classList.remove('hide');
            context.fillStyle = "rgba(155, 155, 155, 0.8)";
            context.fillRect(canvas.width/4, canvas.height/8, canvas.width/2, canvas.height/1.3);
            context.textAling = 'center';
            context.fillStyle = 'White';
            context.font = '25px Sonic'; 
            context.fillText('Game Over!!', canvas.width/2.4, canvas.height/5);
            context.textAling = 'center';
            context.fillStyle = 'White';
            context.font = '25px Sonic'; 
            context.fillText('Tente Novamente!!', canvas.width/2.8, canvas.height/3.8);
            context.fillStyle = "black";
            context.fillRect(canvas.width/3.8, canvas.height/3.5, canvas.width/2.1, 3);
            
            context.fillStyle = 'White';
            context.font = '25px Sonic';
            context.fillText('Score:              ' + zeroEsquerda(score, 7) , canvas.width/3.2, canvas.height/2.5);

            context.fillStyle = 'White';
            context.font = '25px Sonic';
            context.fillText('Tempo:                ' + tempo, canvas.width/3.2, canvas.height/2);

            btnReinicia.addEventListener('click', () => {
                btnReinicia.classList.add('hide');
                btnVolta.classList.add('hide');
                gameOver = false;
                gameSpeed = 3;
                enemySpeed = 7;
                enemyInterval = 4000;
                animate(0);
            });

            btnVolta.addEventListener('click', () => {
                btnReinicia.classList.add('hide');
                btnVolta.classList.add('hide');
            });

        }
        else{
            if(score >= 9999999){
                context.fillText('Score: 9999999', canvas.width - 290, 40);
                return;
            }
            context.fillStyle = "rgba(230, 15, 15, 0.8)";
            context.fillRect(canvas.width - 300, 10, 290, 40);
            context.fillStyle = 'White';
            context.font = '25px Sonic';
            context.fillText('Score: ' + zeroEsquerda(score, 7) , canvas.width - 290, 40);
            
            context.fillStyle = "rgba(230, 15, 15, 0.8)";
            context.fillRect(10, 10, 270, 40);
            context.fillStyle = 'White';
            context.font = '25px Sonic';
            context.fillText('Tempo: ' + tempo , 20 , 40);
        }
        
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const titlescreen = new StartScreen(canvas.width, canvas.height);

    const layer1 = new Background(canvas.width, canvas.height, backgroundLayer1, 1.5);
    const layer2 = new Background(canvas.width, canvas.height, backgroundLayer2, 0.5);

    const layerObject = [layer2, layer1];


    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0,0, canvas.width, canvas.height);

        layerObject.forEach(object => {
            object.update();
            object.draw(ctx);
        });

        if(!startScreen){
            player.draw(ctx);
            player.update(input, deltaTime, enemies);
            
            handleEnemies(deltaTime);
            displayStatusText(ctx);
        }

        if(startScreen){
            titlescreen.draw(ctx);
            titlescreen.update();
        }
        

        if(!gameOver) requestAnimationFrame(animate);
    }

    let scoreInterval = setInterval(scoreGenerator, scoreIntervalTime);  
    setInterval(timeGenerator, 1000);
    setInterval(gameSpeedManager, 100);
    animate(0);

});

//TODO 

// adicionar animação de morte
// fazer botoes gameover funcionar
// adicionar Rings de pontuação/moeda de jogo
// adicionar features na loja
// adicionar skins a loja
// apos inicio escolher dificuldade