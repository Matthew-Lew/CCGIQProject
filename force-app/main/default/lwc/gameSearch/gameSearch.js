import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GameSearch extends LightningElement {
    @track games = [];
    @track filteredGames = null;

    //variables to decide which list to show
    showFilteredGames = false;
    showGames;

    //sortingDropDown Variable
    value = 'aToZ';

    //Modal Variables
    displayModal = false;
    gameName;
    gameImage;

    searchGames(event) {
        let searchInput = this.template.querySelector('lightning-input').value;
        this.showGames = true;
        //search cheapshark deals with the text from input field only when not empty
        if(searchInput != '') {
            fetch('https://www.cheapshark.com/api/1.0/deals?title=' + searchInput)
            .then((res) => res.json())
            .then(data => {
                this.games = data;
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

        //filter the games array to get the object that they clicked on
        let currentObject = this.games.filter(game => (game.title == event.target.textContent && 
                                                       game.storeID == event.target.title));
        
        //display the info from the object
        this.gameName = currentObject[0].title;
        this.gameImage = currentObject[0].thumb;
    }

    displayLessInfo(event) {
        this.displayModal = false;
    }

    sortGames(event) {    
        switch(event.target.value) {
            case 'aToZ':
                this.games.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
                break;
            case 'zToA':
                this.games.sort((a,b) => (a.title < b.title) ? 1 : ((b.title < a.title) ? -1 : 0));
                break;
            case 'lowToHigh':
                this.games.sort((a,b) => (parseInt(a.salePrice) > parseInt(b.salePrice)) ? 1 : ((parseInt(b.salePrice) > parseInt(a.salePrice)) ? -1 : 0));
                break;
            case 'highToLow':
                this.games.sort((a,b) => (parseInt(a.salePrice) < parseInt(b.salePrice)) ? 1 : ((parseInt(b.salePrice) < parseInt(a.salePrice)) ? -1 : 0));
                break;
        }
    }

    filterGames(event) {
        //show only the filtered results and hide the nonfiltered results
        this.showGames = false;
        this.showFilteredGames = true;

        //make variables to track the filter ranges
        let lowerBound;
        let upperBound;

        switch(event.target.value) {
            case 'none':
                this.showGames = true;
                this.showFilteredGames = false;
                break;
            case 'fifteenMinus':
                upperBound = 15;
                this.filteredGames = this.games.filter(game => game.salePrice <= upperBound);
                break;
            case 'fifteentoThirty':
                lowerBound = 15;
                upperBound = 30;
                this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound && game.salePrice < upperBound);
                break;
            case 'thirtyToFortyFive':
                this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound && game.salePrice < upperBound);
                break;
            case 'fortyFivePlus':
                this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound);
                break;
        }
    }

    //nothing but sorting and filter getters below
    get sortingOptions() {
        return [
            { label: 'A to Z', value: 'aToZ' },
            { label: 'Z to A', value: 'zToA' },
            { label: 'Price: Lowest to Highest', value: 'lowToHigh' },
            { label: 'Price: Highest to Lowest', value: 'highToLow' }
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