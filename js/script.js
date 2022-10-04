window.addEventListener('load', function(){
    
    //variaveis de tela
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 600;
    const backgroundLayer1 = document.getElementById('grondImg');
    const backgroundLayer2 = document.getElementById('background');
    
    //variaveis globais
    let enemies = [];
    let seconds = 0, minutes = 0, score = 0, tempo = '00 : 00';
    
    let gameSpeed = 2;
    let gameOver = false;

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 2500;
    let randomEnemyInterval = Math.random() * enemyInterval; 
    let enemySpeed = 5;

    
    let sonicFrameY = 0;
    let sonicframeTimer = -5;
    let sonicBall = false;



    class InputHandler {
        constructor(){
            this.keys = [];
            window.addEventListener('keydown', e => {
                if((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') 
                    && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')){
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
            this.x = 0;
            this.y = (this.gameHeight - 110) - this.height ;
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
            //colision check
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
            if(input.keys.indexOf('ArrowRight') > -1){
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
                this.weight = 3;
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
                
                if(this.y != (this.gameHeight - 110) - this.height){
                    this.y = (this.gameHeight - 110) - this.height
                };

                this.frameY = sonicFrameY; 
                if(gameSpeed > 3 && gameSpeed < 8)sonicframeTimer = 5;

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
            return this.y >= (this.gameHeight - 110) - this.height;
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

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 220;
            this.height = 120;
            this.image = document.getElementById('enemyImg');
            this.x = this.gameWidth;
            this.y = -115 + this.gameHeight - this.height;
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
        
        if(!gameOver){
            gameSpeed += 0.01;
            enemySpeed += 0.01;
            enemyInterval -= 1;
            randomEnemyInterval = Math.random() * enemyInterval; 
            
            if( gameSpeed >= 15) gameSpeed = 15;
            if (enemySpeed >= 25) enemySpeed = 25;
            if (enemyInterval <= 800) enemyInterval = 800 ;

        }
        
    }   

    const scoreGenerator = () => score++;
   

    function displayStatusText(context) {

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


        if(gameOver){
            
            context.textAling = 'center';
            context.fillStyle = 'Black';
            context.font = '30px Sonic'; 
            context.fillText('Game Over!! Tente Novamente', canvas.width/4, canvas.height/2);
            context.textAling = 'center';
            context.fillStyle = 'White';
            context.font = '30px Sonic'; 
            context.fillText('Game Over!! Tente Novamente', canvas.width/4 + 3, canvas.height/2 + 3);

        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
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

        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        
        handleEnemies(deltaTime);
        displayStatusText(ctx);

        if(!gameOver) requestAnimationFrame(animate);
    }

    setInterval(scoreGenerator, 250);
    setInterval(timeGenerator, 1000);
    setInterval(gameSpeedManager, 100);
    animate(0);

});