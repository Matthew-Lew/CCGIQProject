import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GameSearch extends LightningElement {
    @track games = [];
    @track filteredGames = null;

    //sortingDropDown Variable
    value = 'aToZ';

    //Modal Variables
    displayModal = false;
    gameName;
    gameImage;

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

                //sort and filter the list according to currently selected values
                this.filterPrice(this.template.querySelector('lightning-combobox[data-id=filterDropdown]').value);
                this.sort(this.template.querySelector('lightning-combobox[data-id=sortingDropdown]').value);
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
        this.sort(event.target.value);
    }

    filterGamesPrice(event) {
        this.filterPrice(event.target.value);
    }
s
    filterPrice(filterValue) {
            //make variables to track the filter price ranges
            let lowerBound;
            let upperBound;

            //grab the current sorting condition in order to re-sort after the filter
            let sortingCondition = this.template.querySelector('lightning-combobox[data-id=sortingDropdown]').value;
    
            switch(filterValue) {
                case 'none':
                    this.filteredGames = this.games;
                    this.sort(sortingCondition);
                    break;
                case 'fifteenMinus':
                    upperBound = 15;
                    this.filteredGames = this.games.filter(game => game.salePrice <= upperBound);
                    this.sort(sortingCondition);
                    break;
                case 'fifteentoThirty':
                    lowerBound = 15;
                    upperBound = 30;
                    this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound && game.salePrice < upperBound);
                    this.sort(sortingCondition);
                    break;
                case 'thirtyToFortyFive':
                    lowerBound = 30;
                    upperBound = 45;
                    this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound && game.salePrice < upperBound);
                    this.sort(sortingCondition);
                    break;
                case 'fortyFivePlus':
                    lowerBound = 45;
                    this.filteredGames = this.games.filter(game => game.salePrice >= lowerBound);
                    this.sort(sortingCondition);
                    break;
            }
    }

    sort(sortCondition) {
        if(this.filteredGames) {
            switch(sortCondition) {
                case 'aToZ':
                    this.filteredGames.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
                    break;
                case 'zToA':
                    this.filteredGames.sort((a,b) => (a.title < b.title) ? 1 : ((b.title < a.title) ? -1 : 0));
                    break;
                case 'lowToHigh':
                    this.filteredGames.sort((a,b) => (parseFloat(a.salePrice) > parseFloat(b.salePrice)) ? 1 : ((parseFloat(b.salePrice) > parseFloat(a.salePrice)) ? -1 : 0));
                    break;
                case 'highToLow':
                    this.filteredGames.sort((a,b) => (parseFloat(a.salePrice) < parseFloat(b.salePrice)) ? 1 : ((parseFloat(b.salePrice) < parseFloat(a.salePrice)) ? -1 : 0));
                    break;
            }
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