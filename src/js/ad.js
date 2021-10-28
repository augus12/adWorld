App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Advertise.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Advertise = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Advertise.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function() {
    var electionInstance;

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Advertise.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.advertisementsCount({from: App.account});
    }).then(function(adsCount) {
      var adResults = $("#allAds");
      adResults.empty();
      for (var i = 1; i <= adsCount; i++) {
        electionInstance.advertisements(i).then(function (ad) {
          var adSource  = ad.source;
          var adContent = ad.content;
          var category = ad.categoryId;
          electionInstance.categories(category).then(function(categ) {
            var cat = categ.name;
              // Render category Result
            var candidateTemplate = "<tr><th>" + adSource + "</th><td>" + adContent + "</td><td>" + cat  + "</td></tr>"
            adResults.append(candidateTemplate);
          });
          
        });
      }
        return electionInstance.categoriesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.categories(i).then(function(category) {
          var id = category[0];
          var name = category[1];
          if (id == 1) candidatesResults.empty();
          // Render category ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
    }).catch(function(error) {
      console.warn(error);
    });
  },  

   addAdvertisement: function() {
    var candidateId = $('#candidatesSelect').val();
    var source = $('#source').val();
    var adContent = $('#adContent').val();
    console.log(source + ' ' + adContent + " " + candidateId);
    App.contracts.Advertise.deployed().then(function(instance) {
      return instance.addAdvertisement(source, adContent, candidateId, { from: App.account });
    }).then(function(result) {
      console.log(result);
      // Wait for votes to update
      // $("#content").hide();
      return App.render();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});