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

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Advertise.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.activityEvent(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        return App.refreshAds();
      });
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

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
          var voteCount = category[2];
          if (id == 1) candidatesResults.empty();
          // Render category Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render category ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      loader.hide();
      content.show();
      return electionInstance.getAds(2, { from: App.account });
    }).then(function(adRes) {
      //console.log(util.inspect(adRes, false, null, true /* enable colors */))
      console.log(adRes);
      console.log("hi");
      var adResults = $("#adResults");
      adResults.empty();
      for (var i = 0; i < adRes.length; i++) {
          var adSource  = adRes[i].source;
          var adContent = adRes[i].content;
          var category = adRes[i].categoryId;
          // Render category Result
          var candidateTemplate = "<tr><td>" + adSource + "</td><td>" + adContent + "</td><td>" + category  + "</td></tr>"
          adResults.append(candidateTemplate);
      }
    }).catch(function(error) {
      console.warn(error);
    });
  }, 


  refreshAds: function() {
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
      return electionInstance.getAds(2, { from: App.account });
    }).then(function(adRes) {
      //console.log(util.inspect(adRes, false, null, true /* enable colors */))
      console.log(adRes);
      console.log("hi");
      var adResults = $("#adResults");
      adResults.empty();
      for (var i = 0; i < adRes.length; i++) {
          var adSource  = adRes[i].source;
          var adContent = adRes[i].content;
          var category = adRes[i].categoryId;
          // Render category Result
          var candidateTemplate = "<tr><td>" + adSource + "</td><td>" + adContent + "</td><td>" + category  + "</td></tr>"
          adResults.append(candidateTemplate);
      }
    }).catch(function(error) {
      console.warn(error);
    });
  },  


  viewCategory: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Advertise.deployed().then(function(instance) {
      console.log("CandidateID: " + candidateId);
      return instance.viewCategory(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      // $("#content").hide();
      // $("#loader").show();
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