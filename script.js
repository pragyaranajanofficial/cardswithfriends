let currentGame = null;

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.element = this.createCardElement();
    }

    createCardElement() {
        const card = document.createElement('div');
        card.className = 'card';
        
        const inner = document.createElement('div');
        inner.className = 'card-inner';
        
        const front = document.createElement('div');
        front.className = 'card-front';
        
        const img = document.createElement('img');
        img.src = this.getCardImageUrl();
        img.alt = `${this.value} of ${this.suit}`;
        img.onerror = () => {
            img.src = this.getFallbackImageUrl();
        };
        front.appendChild(img);
        
        const back = document.createElement('div');
        back.className = 'card-back';
        
        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);
        
        return card;
    }

    getCardImageUrl() {
        const suitMap = {
            'hearts': 'H',
            'diamonds': 'D',
            'clubs': 'C',
            'spades': 'S'
        };
        
        const valueMap = {
            'J': 'JACK',
            'Q': 'QUEEN',
            'K': 'KING',
            'A': 'ACE'
        };

        const cardValue = valueMap[this.value] || this.value;
        const cardSuit = suitMap[this.suit];
        
        return `https://www.improvemagic.com/wp-content/uploads/2020/11/${this.value.toLowerCase()}_of_${this.suit.toLowerCase()}.png`;
    }

    getFallbackImageUrl() {
        const suitMap = {
            'hearts': 'H',
            'diamonds': 'D',
            'clubs': 'C',
            'spades': 'S'
        };
        return `https://deckofcardsapi.com/static/img/${this.value}${suitMap[this.suit]}.png`;
    }

    flip() {
        this.element.classList.toggle('flipped');
    }
}

class Game {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.opponentHand = [];
        this.score = 0;
        this.gameTime = 0;
        this.timer = null;
        this.isLoading = true;
        this.loadImages().then(() => {
            this.isLoading = false;
            document.getElementById('loading').classList.add('hidden');
            this.initializeGame();
        });
    }

    async loadImages() {
        document.getElementById('loading').classList.remove('hidden');
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        const preloadImage = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve();
                img.src = url;
            });
        };

        const imagePromises = [];
        for (let suit of suits) {
            for (let value of values) {
                const card = new Card(suit, value);
                imagePromises.push(preloadImage(card.getCardImageUrl()));
                imagePromises.push(preloadImage(card.getFallbackImageUrl()));
            }
        }

        await Promise.all(imagePromises);
    }

    initializeGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialCards();
        this.startTimer();
        this.setupEventListeners();
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        for (let suit of suits) {
            for (let value of values) {
                this.deck.push(new Card(suit, value));
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealInitialCards() {
        this.playerHand = this.deck.splice(0, 5);
        this.opponentHand = this.deck.splice(0, 5);
        this.displayPlayerHand();
        this.displayOpponentHand();
        this.updateCardCounts();
    }

    displayPlayerHand() {
        const playerHandElement = document.getElementById('player-hand');
        playerHandElement.innerHTML = '';
        
        this.playerHand.forEach(card => {
            card.element.classList.add('dealing');
            card.element.onclick = () => this.playCard(card);
            playerHandElement.appendChild(card.element);
            setTimeout(() => card.flip(), 500);
        });
    }

    displayOpponentHand() {
        const opponentHandElement = document.getElementById('opponent-hand');
        opponentHandElement.innerHTML = '';
        
        this.opponentHand.forEach(card => {
            opponentHandElement.appendChild(card.element);
        });
    }

    updateCardCounts() {
        document.getElementById('opponent-card-count').textContent = this.opponentHand.length;
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.gameTime++;
            document.getElementById('time').textContent = this.formatTime(this.gameTime);
        }, 1000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    cleanup() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        const drawButton = document.getElementById('draw-card');
        const endTurnButton = document.getElementById('end-turn');
        if (drawButton) drawButton.replaceWith(drawButton.cloneNode(true));
        if (endTurnButton) endTurnButton.replaceWith(endTurnButton.cloneNode(true));
    }

    setupEventListeners() {
        const drawButton = document.getElementById('draw-card');
        const endTurnButton = document.getElementById('end-turn');
        
        drawButton.addEventListener('click', () => this.drawCard());
        endTurnButton.addEventListener('click', () => this.endTurn());
    }

    playCard(card) {
        const playedCardsElement = document.getElementById('played-cards');
        card.element.classList.add('played-card');
        playedCardsElement.appendChild(card.element);
        
        const cardIndex = this.playerHand.indexOf(card);
        if (cardIndex > -1) {
            this.playerHand.splice(cardIndex, 1);
            this.updateScore(card);
        }
        
        this.updateCardCounts();
        this.checkGameEnd();
    }

    drawCard() {
        if (this.deck.length > 0) {
            const card = this.deck.pop();
            this.playerHand.push(card);
            card.element.classList.add('dealing');
            this.displayPlayerHand();
        }
    }

    updateScore(card) {
        const valueMap = {
            'A': 11,
            'K': 10,
            'Q': 10,
            'J': 10,
            '10': 10,
            '9': 9,
            '8': 8,
            '7': 7,
            '6': 6,
            '5': 5,
            '4': 4,
            '3': 3,
            '2': 2
        };
        
        this.score += valueMap[card.value];
        document.getElementById('score').textContent = this.score;
    }

    endTurn() {
        if (this.opponentHand.length > 0) {
            const card = this.opponentHand[Math.floor(Math.random() * this.opponentHand.length)];
            this.opponentHand = this.opponentHand.filter(c => c !== card);
            card.flip();
            setTimeout(() => {
                this.playOpponentCard(card);
            }, 1000);
        }
    }

    playOpponentCard(card) {
        const playedCardsElement = document.getElementById('played-cards');
        card.element.classList.add('played-card');
        playedCardsElement.appendChild(card.element);
        this.updateCardCounts();
        this.checkGameEnd();
    }

    checkGameEnd() {
        if (this.playerHand.length === 0 || this.opponentHand.length === 0) {
            clearInterval(this.timer);
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('game-over').classList.remove('hidden');
        }
    }
}

function verifyAge() {
    const birthdateInput = document.getElementById('birthdate');
    if (!birthdateInput.value) {
        alert('Please enter your birth date');
        return;
    }

    const birthdate = new Date(birthdateInput.value);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    
    if (today.getMonth() < birthdate.getMonth() || 
        (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())) {
        age--;
    }

    if (age >= 16) {
        document.getElementById('age-verification').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        if (currentGame) {
            currentGame.cleanup();
        }
        currentGame = new Game();
    } else {
        alert('You must be 16 or older to play this game.');
    }
}

function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    if (currentGame) {
        currentGame.cleanup();
    }
    currentGame = new Game();
}

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    
    const birthdateInput = document.getElementById('birthdate');
    if (birthdateInput) {
        birthdateInput.min = minDate.toISOString().split('T')[0];
        birthdateInput.max = maxDate.toISOString().split('T')[0];
    }
});