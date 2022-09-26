import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GameSearch extends LightningElement {
    @track stores;
    @track games;
    @track filteredGames;
    @track displayGames;
    currentPage = 1;
    totalNumResults;
    noNextPage = false;
    noPrevPage = true;
    numGamesToShow = 10;

    //keeping track of filtering and sorting conditions
    sortingCondition = 'aToZ';
    filteringCondition = 'none';

    //Modal Variables
    displayModal = false;
    gameName;
    gameImage;
    gameRating;
    normalPrice;
    salePrice;
    steamRating;
    steamLink;
    metacriticRating;
    metacriticLink;
    storeName;

    searchGames(event) {
        let searchInput = this.template.querySelector('lightning-input').value;
        //search cheapshark deals with the text from input field only when not empty
        if(searchInput != '') {
            fetch('https://www.cheapshark.com/api/1.0/deals?title=' + searchInput)
            .then((res) => res.json())
            .then(data => {
                //keep a full version of the list of games for filtering/sorting reasons
                this.games = data;
                this.filteredGames = this.games;
                this.totalNumResults = this.games.length;
                
                for(let game of this.filteredGames) {
                    this.evaluateRating(game);
                }
                //sort and filter the list according to currently selected values
                this.filterPrice();
                this.sort();
                this.showCurrentPage();
            })
            .catch((error) => {
                const event = new ShowToastEvent({
                    title: 'An Error Has Occured:',
                    message:
                        'please try again later',
                    variant: 'error'
                });
                this.dispatchEvent(event);
            })
        }
    }

    displayMoreInfo(event) {
        this.displayModal = true;

        //find the game object clicked on using title field on the html a tag
        let currentObject = this.games.find(game => game.dealID == event.target.title);

        fetch('https://www.cheapshark.com/api/1.0/stores')
        .then(res => res.json())
        .then(data => {
            this.stores = data;
            if(this.stores) {
                //unfortunately the API does not provide a link to store site so we just get name
                this.storeName = this.stores.find(store => store.storeID == currentObject.storeID).storeName;
            }
        })
        .catch(error => {
            const event = new ShowToastEvent({
                title: 'An error occured trying to get store info',
                message:
                    'some data may not be available',
                variant: 'error'
            });
            this.dispatchEvent(event);
            this.stores = null;
        })
        
        //display the info from the object
        this.gameName = currentObject.title;
        this.gameImage = currentObject.thumb;
        this.gameRating = currentObject.dealRating;
        this.normalPrice = currentObject.normalPrice;
        this.salePrice = currentObject.salePrice;
        if (currentObject.steamRatingPercent == '0') {
            this.steamRating = null;
        } else {
            this.steamRating = currentObject.steamRatingPercent;
        }
        if(currentObject.metacriticScore == '0') {
            this.metacriticRating = null;
        } else {
            this.metacriticRating = currentObject.metacriticScore;
        }
        if (currentObject.steamAppID) {
            this.steamLink = 'https://store.steampowered.com/app/' + currentObject.steamAppID;
        }
        if(currentObject.metacriticLink) {
            this.metacriticLink = 'https://www.metacritic.com/' + currentObject.metacriticLink;
        }
    }

    displayLessInfo(event) {
        this.displayModal = false;
    }

    sortGames(event) {
        this.sortingCondition = event.target.value;
        this.sort(this.sortingCondition);
    }

    filterGamesPrice(event) {
        this.filteringCondition = event.target.value;
        this.filterPrice(this.filteringCondition);
    }
    
    showCurrentPage() {
        //get the current page and display the 10 records for that page
        this.displayGames = this.filteredGames.slice((this.currentPage -1) * this.numGamesToShow, (this.currentPage) * this.numGamesToShow);
        if(this.totalNumResults <= this.currentPage * this.numGamesToShow) {
            this.noNextPage = true;
        } else {
            this.noNextPage = false;
        }
        if(this.currentPage - 1 == 0) {
            this.noPrevPage = true;
        } else {
            this.noPrevPage = false;
        }
    }

    filterPrice() {
            //make variables to track the filter price ranges
            let lowerBound;
            let upperBound;
    
            switch(this.filteringCondition) {
                case 'none':
                    this.filteredGames = this.games;
                    this.totalNumResults = this.filteredGames.length;
                    this.sort();
                    this.currentPage = 1;
                    this.showCurrentPage();
                    break;
                case 'fifteenMinus':
                    upperBound = 15;
                    this.filteredGames = this.games.filter(game => game.salePrice <= upperBound);
                    this.totalNumResults = this.filteredGames.length;
                    this.sort();
                    this.currentPage = 1;
                    this.showCurrentPage();
                    break;
                case 'fifteentoThirty':
                    lowerBound = 15;
                    upperBound = 30;
                    this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound && game.salePrice < upperBound);
                    this.totalNumResults = this.filteredGames.length;
                    this.sort();
                    this.currentPage = 1;
                    this.showCurrentPage();
                    break;
                case 'thirtyToFortyFive':
                    lowerBound = 30;
                    upperBound = 45;
                    this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound && game.salePrice < upperBound);
                    this.totalNumResults = this.filteredGames.length;
                    this.sort();
                    this.currentPage = 1;
                    this.showCurrentPage();
                    break;
                case 'fortyFivePlus':
                    lowerBound = 45;
                    this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound);
                    this.totalNumResults = this.filteredGames.length;
                    this.sort();
                    this.currentPage = 1;
                    this.showCurrentPage();
                    break;
            }
    }

    sort() {
        if(this.filteredGames) {
            switch(this.sortingCondition) {
                case 'aToZ':
                    this.filteredGames.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
                    this.showCurrentPage();
                    break;
                case 'zToA':
                    this.filteredGames.sort((a,b) => (a.title < b.title) ? 1 : ((b.title < a.title) ? -1 : 0));
                    this.showCurrentPage();
                    break;
                case 'priceLowToHigh':
                    this.filteredGames.sort((a,b) => (parseFloat(a.salePrice) > parseFloat(b.salePrice)) ? 1 : ((parseFloat(b.salePrice) > parseFloat(a.salePrice)) ? -1 : 0));
                    this.showCurrentPage();
                    break;
                case 'priceHighToLow':
                    this.filteredGames.sort((a,b) => (parseFloat(a.salePrice) < parseFloat(b.salePrice)) ? 1 : ((parseFloat(b.salePrice) < parseFloat(a.salePrice)) ? -1 : 0));
                    this.showCurrentPage();
                    break;
                case 'ratingHighToLow':
                    this.filteredGames.sort((a,b) => (a.dealRating < b.dealRating) ? 1 : ((b.dealRating < a.dealRating) ? -1 : 0));
                    this.showCurrentPage();
                    break;
                case 'ratingLowToHigh':
                    this.filteredGames.sort((a,b) => (a.dealRating > b.dealRating) ? 1 : ((b.dealRating > a.dealRating) ? -1 : 0));
                    this.showCurrentPage();
                    break;
            }
        }
    }

    previousPage() {
        if(this.currentPage > 1) {
            this.currentPage--;
            this.showCurrentPage();
        }
    }

    nextPage() {
        this.currentPage++;
        this.showCurrentPage();
    }

    evaluateRating(game) {
        if (game.dealRating >= 7) {
            game.highRating = true;
            game.medRating = false;
            game.lowRating = false;
        } else if (game.dealRating < 7 && game.dealRating >= 4) {
            game.highRating = false;
            game.medRating = true;
            game.lowRating = false;
        } else {
            game.highRating = false;
            game.medRating = false;
            game.lowRating = true;
        }
    }

    //nothing but sorting and filter getters below
    get sortingOptions() {
        return [
            { label: 'A to Z', value: 'aToZ' },
            { label: 'Z to A', value: 'zToA' },
            { label: 'Price: Lowest to Highest', value: 'priceLowToHigh' },
            { label: 'Price: Highest to Lowest', value: 'priceHighToLow' },
            { label: 'Deal Rating: Highest to lowest', value: 'ratingHighToLow' },
            { label: 'Deal Rating: Lowest to Highest', value: 'ratingLowToHigh' }
        ];
    }

    get filterOptions() {
        return [
            { label: 'None', value: 'none' },
            { label: '$15 or less', value: 'fifteenMinus' },
            { label: '$15 - $30', value: 'fifteentoThirty' },
            { label: '$30 - $45', value: 'thirtyToFortyFive' },
            { label: '$45+', value: 'fortyFivePlus' }
        ];
    }
}