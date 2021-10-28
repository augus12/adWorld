pragma solidity >=0.4.20;
pragma experimental ABIEncoderV2;

contract Advertise {

    struct Advertisement {
        uint id;
        string source;
        string content;
        uint categoryId;
    }

    // Category of Advertisement
    struct Category {
        uint id;
        string name;
        uint totalAds;
    }

    // User Activity for a category
    struct CategoryActivity {
        uint categoryId;
        uint viewCount;
        bool blockAds;
    }


    // activity event
    event activityEvent (
        address indexed _source,
        uint indexed _categoryId
    );

    mapping(address =>  CategoryActivity[]) public categoryActivities;
    mapping(address =>  bool) private isValidClient;
    mapping(uint =>  Advertisement) public advertisements;
    mapping(uint =>  Category) public categories;
    mapping(uint =>  uint[]) public categoryAdvertisementIds;
    
    uint public advertisementsCount;
    uint public categoriesCount;


    constructor () public {
        addCategory("Sports");
        addCategory("Grocery");
        addCategory("Movies");
        addCategory("Technology");
        addCategory("Cars");
        addCategory("Retail");
        addCategory("Finance");
        addCategory("Travel");
        addCategory("Food");
        addCategory("Music");
    }

    // private method to add new ad category
      function addCategory (string memory _name) private {
        categoriesCount ++;
        categories[categoriesCount] = Category(categoriesCount, _name, 0);
    }

    // Adds new advertisement
    function addAdvertisement (string memory _source, string memory _content, uint _categoryId) public {
        advertisementsCount ++;
        advertisements[advertisementsCount] = Advertisement(advertisementsCount, _source, _content, _categoryId);
        categories[_categoryId].totalAds ++;
        categoryAdvertisementIds[_categoryId].push(advertisementsCount);
    }


    function initializeUser(address _senderAddress) private {
        for (uint i=0; i< categoriesCount; i++) {
            categoryActivities[_senderAddress].push(CategoryActivity(i+1, 0, false));
        }
        isValidClient[_senderAddress] = true;
    }

    // client views content of a particular category
    function viewCategory(uint _categoryId) public {
        if (!isValidClient[msg.sender]) {
           initializeUser(msg.sender);
        }

        categoryActivities[msg.sender][_categoryId-1].viewCount++;
        emit activityEvent(msg.sender, _categoryId);
    }

    // returns ads relevent to user
    function getAds(uint _len) public view returns (Advertisement[] memory) {
        
        uint[] memory top = topNCategories(_len, msg.sender);
        Advertisement[] memory _sources = new Advertisement[](top.length);
        for (uint i = 0; i<top.length; i++) {
            uint[] memory _ads = categoryAdvertisementIds[top[i]];
            // randomly pick one ad from the category
            Advertisement memory _ad = advertisements[_ads[random(_ads.length, msg.sender)]];
            _sources[i] = _ad;
        }

        return _sources;
    }

    // returns random number between 0 and limit
    function random(uint _limit, address _senderAddress) private view returns (uint) {
        uint nonce = 10;
        uint randomnumber = uint(keccak256(abi.encodePacked(now, _senderAddress, nonce))) % _limit;
        return randomnumber;
    }


    // returns top _len categories based on viewCount
    function topNCategories(uint _maxLen, address _senderAddress) view private returns (uint[] memory) {

        uint[] memory sorted = insertion_sort(_senderAddress);

        uint len = 0;
        for (uint i=0; i < categoriesCount && len < _maxLen; i++) {
            if (categories[sorted[i]].totalAds > 0) {
                len ++;
            }
        }

        uint[] memory s = new uint[](len);
        uint k = 0;
        for (uint i=0; k < _maxLen && i < categoriesCount; i++) {
            if (categories[sorted[i]].totalAds > 0) {
                s[k++] = sorted[i];
            }
        }

        return s;
    }


    // sort categories based on viewCount
    function insertion_sort(address _senderAddress) private view returns (uint[] memory){
        uint[] memory data = new uint[](categoriesCount);
        for (uint i=0; i < categoriesCount; i++) {
            data[i] = i+1;
        }
         
        CategoryActivity[] memory _categoryActivities = categoryActivities[_senderAddress];
        uint length = data.length;
        for (uint i = 1; i < length; i++) {
            uint key = _categoryActivities[i].viewCount;
            uint ele = data[i];
            uint j = i - 1;
            while ((int(j) >= 0) && (_categoryActivities[j].viewCount < key)) {
                data[j + 1] = data[j];
                j--;
            }
            data[j + 1] = ele;
        }

        return data;
    }
}
