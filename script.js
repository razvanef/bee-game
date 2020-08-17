const damage = {
    'queen': 8,
    'worker': 10,
    'drone': 12
}
const healthPoints = {
    'queen': 100,
    'worker': 75,
    'drone': 50
}
const swarmComponent = {
    'queen': 1,
    'worker': 5,
    'drone': 8
}

class Bee {
    constructor(id, type, hp) {
        this.id = id;
        this.type = type;
        this.hp = hp;
        this.alive = this.hp > 0;
    }

    getId() {
        return this.id;
    }

    getHp() {
        return this.hp;
    }

    getAlive() {
        return this.alive;
    }

    getType() {
        return this.type;
    }

    isQueen() {
        return this.type === 'queen';
    }

    hitBee() {
        this.hp -= damage[this.type];
    }

    killBee() {
        this.alive = false;
    }
}

class Swarm {
    constructor(beesStateString) {
        this.bees = [];
        
        this.populateSwarm(beesStateString);
    }

    populateSwarm(beesStateString) {
        if (beesStateString) {
            const beesState = JSON.parse(beesStateString);
            for (let bee of beesState) {
                this.bees.push(new Bee(bee.id, bee.type, bee.hp));
            }
            
            return;
        }

        for (let beeType in swarmComponent) {
            for (let i = 0; i < swarmComponent[beeType]; i++) {
                this.bees.push(new Bee(i, beeType, healthPoints[beeType]))
            }
        }
        this.bees.sort(() => Math.random() - 0.5);
    }

    hit() {
        const selectedBee = this.getRandom();
        const beeElem = document.getElementById(`bee-${selectedBee.getId()}`);

        beeElem.classList.add('bounce-bee');
        setTimeout(function() {
            beeElem.classList.remove("bounce-bee");
        }, 300);
        selectedBee.hitBee();
        if (selectedBee.getHp() < 1) selectedBee.killBee();
        if (selectedBee.isQueen() && !selectedBee.getAlive()) this.killSwarm();
        this.updateSwarm(selectedBee)
        if (this.isGameOver()) {
            document.getElementsByClassName('game-over')[0].style.display = 'block';
            localStorage.removeItem('beeGame');
        }
        localStorage.setItem('beeGame', JSON.stringify(this.bees))
    }

    killSwarm() {
        for (let bee of this.bees) bee.alive = false;
    }

    isGameOver() {
        return this.bees.filter(bee => bee.alive).length === 0
    }

    displaySwarm() {
        return this.bees.map((bee,key) => {
            let beeElem = document.createElement('div');
            beeElem.id = `bee-${key}`;
            beeElem.className += `bee bee-${bee.getType()}`;
            const tooltip = document.createElement('span')
            if (!bee.getAlive()) beeElem.classList.add('dead-bee');
            tooltip.textContent = `${bee.getType().toUpperCase()} - HP: ${bee.getHp()}`;
            beeElem.appendChild(tooltip).classList.add('tooltip');

            return beeElem;
        });
        
    }

    updateSwarm(selectedBee) {
        let element = document.getElementById(`bee-${selectedBee.id}`);
        let tooltip = element.getElementsByClassName('tooltip')[0];
        if (!selectedBee.getAlive()) element.classList.add('dead-bee');
        tooltip.textContent = `${selectedBee.getType().toUpperCase()} - HP: ${selectedBee.getHp()}`;
    }

    getRandom() {
        const arr = this.bees.filter(bee => bee.getAlive())
        const rand = Math.floor(Math.random() * Math.floor(arr.length-1))
        
        return arr[rand];
    }
}

class Game {
    start() {
        const beesStateString = localStorage.getItem('beeGame');
        this.swarm = new Swarm(beesStateString || null);
        document.getElementsByClassName('content')[0].classList.remove('start-game');
        document.getElementsByClassName('game-over')[0].style.display = 'none';
        this.display();
    }

    reset() {
        localStorage.removeItem('beeGame');
        document.getElementsByClassName('content')[0].classList.remove('start-game');
        document.getElementsByClassName('game-over')[0].style.display = 'none';
        this.swarm = new Swarm();
        this.display();
    }

    display() {
        const nodes = this.swarm.displaySwarm();
        let app = document.querySelector('#swarm');
        app.innerHTML = '';

        app.append(...nodes);
    }

    hit() {
        this.swarm.hit();
    }
}


if (!localStorage.getItem('beeGame')) {
    document.getElementsByClassName('load-btn')[0].style.display = 'none';
}
const game = new Game();


