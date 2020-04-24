import Web3 from 'web3';
import MyShop from '../build/contracts/MyShop.json';

let web3;
let myShop;

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    // New metamask
    if(typeof window.ethereum !== 'undefined') {
      window.ethereum.enable().then(() => {
        resolve(
          new Web3(window.ethereum)
      );
      })
      .catch(e => {
        reject(e);
      });
      return;
    }
    // Old metamask
    if(typeof window.web3 !== 'undefined') {
      return resolve(
      new Web3(window.web3.currentProvider)
    );
    }
    // No metamask, go to Ganache
    resolve(new Web3('localhost:7545'));
  });
};

const initContract = () => {
  const contractNetworks = Object.keys(
    MyShop.networks)[0];
  return new web3.eth.Contract(
    MyShop.abi, MyShop.networks[contractNetworks].address);
};

const initApp = () => {
  const $addItem = document.getElementById('addItem');
  const $showItem = document.getElementById('showItem');
  const $updateItem = document.getElementById('updateItem');
  const $listItems = document.getElementById('listItems');
  const $withdraw = document.getElementById('Withdraw');
  const $destroy = document.getElementById('Destroy');
  const $isPaused = document.getElementById('isPaused');
  const $paused = document.getElementById('paused');
  const $listOrders = document.getElementById('listOrders');
  const $listBuyers = document.getElementById('listBuyers');
  const $registerBuyer = document.getElementById('registerBuyer');
  const $buyItem = document.getElementById('buyItem');
  const $showOrder = document.getElementById('showOrder');
  let accounts = [];

  web3.eth.getAccounts().then(_accounts => {
    accounts = _accounts;
    return myShop.methods.listItems().call();
    // return myShop.methods.paused().call();
  }).then(result => {
    $listItems.innerHTML = result;
    // $paused.innerHTML = result1;
  }).then(() => {
    return myShop.methods.paused().call();
  }).then(result => {
    $paused.innerHTML = result;
  }).then(() => {
    return myShop.methods.numOrders().call();
  }).then(result => {
    $listOrders.innerHTML = result;
  }).then(() => {
    return myShop.methods.numBuyers().call();
  }).then(result => {
    $listBuyers.innerHTML = result;
  });

  $isPaused.addEventListener('submit', e =>{
    e.preventDefault();
    myShop.methods.paused().call()
    .then(result => {
      const pResult = result;
      if (pResult === true) {
        myShop.methods.setPaused(false)
        .send({from: accounts[0]}).
        then(() => {
          return myShop.methods.paused().call();
        }).then(result1 => {
          $paused.innerHTML = result1;
        })
      } else if (pResult === false) {
        myShop.methods.setPaused(true)
        .send({from: accounts[0]}).
        then(() => {
          return myShop.methods.paused().call();
        }).then(result1 => {
          $paused.innerHTML = result1;
        })
      }
    })
  });

  $showItem.addEventListener('submit', e =>{
    e.preventDefault();
    const $listItemID = document.getElementById('listItemID');
    const $listItemName = document.getElementById('listItemName');
    const $listItemDesc = document.getElementById('listItemDesc');
    const $listItemInvent = document.getElementById('listItemInvent');
    const $listItemPrice = document.getElementById('listItemPrice');
    myShop.methods.items(e.target.elements[0].value).call().
    then(result2 => {
      $listItemID.innerHTML = result2.itemID;
      $listItemName.innerHTML = result2.itemName;
      $listItemDesc.innerHTML = result2.description;
      $listItemInvent.innerHTML = result2.inventory;
      $listItemPrice.innerHTML = result2.price;
    })
  });

  $showOrder.addEventListener('submit', e =>{
    e.preventDefault();
    const $orderNumber = document.getElementById('orderNumber');
    const $orderBuyerEmail = document.getElementById('orderBuyerEmail');
    const $orderBuyerAddress = document.getElementById('orderBuyerAddress');
    myShop.methods.orders(e.target.elements[0].value).call().
    then(result => {
      $orderNumber.innerHTML = result.orderID;
      $orderBuyerEmail.innerHTML = result.email;
      $orderBuyerAddress.innerHTML = result.shipAddress;
    })
  });

  $registerBuyer.addEventListener('submit', e => {
    e.preventDefault();
    const rBuyerName = e.target.elements[0].value;
    const rBuyerEmail = e.target.elements[1].value;
    const rBuyerAddress = e.target.elements[2].value;
    myShop.methods.registerBuyer(rBuyerName, rBuyerEmail, rBuyerAddress)
    .send({from: accounts[0]})
    .then(() => {
      return myShop.methods.numBuyers().call();
    })
    .then(result => {
      $listBuyers.innerHTML = result;
    });
  });

  $buyItem.addEventListener('submit', e => {
    e.preventDefault();
    let weiToSend;
    const bItemID = e.target.elements[0].value;
    const bItemQty = e.target.elements[1].value;
    myShop.methods.items(bItemID).call()
    .then(result => {
      weiToSend = result.price * bItemQty;
      myShop.methods.BuyItem(bItemID, bItemQty)
      .send({from: accounts[0], value: weiToSend});
    })
    .then(() => {
      return myShop.methods.numOrders().call();
    })
    .then(result => {
      $listOrders.innerHTML = result;
    });
  });

  $addItem.addEventListener('submit', e => {
    e.preventDefault();
    const itemId = e.target.elements[0].value;
    const itemName = e.target.elements[1].value;
    const itemDesc = e.target.elements[2].value;
    const itemInvent = e.target.elements[3].value;
    const itemPrice = e.target.elements[4].value;
    myShop.methods.addItem(itemId, itemName, itemDesc, itemInvent, itemPrice)
    .send({from: accounts[0]})
    .then(() => {
      return myShop.methods.listItems().call();
    })
    .then(result => {
      $listItems.innerHTML = result;
    });
  });

  $updateItem.addEventListener('submit', e => {
    e.preventDefault();
    const itemId = e.target.elements[0].value;
    const itemName = e.target.elements[1].value;
    const itemDesc = e.target.elements[2].value;
    const itemInvent = e.target.elements[3].value;
    const itemPrice = e.target.elements[4].value;
    myShop.methods.updateItem(itemId, itemName, itemDesc, itemInvent, itemPrice)
    .send({from: accounts[0]})
    .then(() => {
      return myShop.methods.listItems().call();
    })
    .then(result => {
      $listItems.innerHTML = result;
    });
  });

  $withdraw.addEventListener('submit', e => {
    e.preventDefault();
    const addressTo = document.getElementById("wdAddress").value;
    myShop.methods.withdrawFunds(addressTo)
    .send({from: accounts[0]});
  });

  $destroy.addEventListener('submit', e => {
    e.preventDefault();
    const addressTo = document.getElementById("dAddress").value;
    myShop.methods.destroyContract(addressTo)
    .send({from: accounts[0]});
  });

};



document.addEventListener('DOMContentLoaded', () => {
  initWeb3().then(_web3 => {
    web3 = _web3;
    myShop = initContract();
    initApp();
  }).catch(e => console.log(e.message));
});
