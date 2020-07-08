// GLOBAL
window.onload = () => {
  isLoading(false);
  displayData();
}
const END_POINT = 'https://trello-clone-ppm.herokuapp.com';
// ----------------------------------

const setup = () => { // ONLOAD EVENT LISTENERS
  document.getElementsByClassName('type-modal')[0].addEventListener('click', modalClick);
  document.body.addEventListener('click', closeModals);
  appendNewListBtn();
}

const modalClick = (e) => { // To stop unnecessary event bubbling
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}

const closeModals = () => {
  let modals = document.getElementsByClassName('type-modal');
  for (let i = 0; i < modals.length; i++) {
    modals[i].style.zIndex = "-999";
    modals[i].style.opacity = "0";
  }
  document.getElementById("newlist-field-wrapper").style.display = "none";
  document.getElementById("newListBtn-wrapper").style.display = "block";
}

// main
const displayData = async () => {
  let lists = await requestData();
  lists.forEach(list => {
    if (list.status === 1) {
      let currentList = new List();
      let cardList = list.cards;
      let cardChunks = '';
      cardList.forEach(card => {
        cardChunks += `
              <div class="trello-card p-2 pb-3 mb-2">
                <span class="overlay-edit-button"><i class="fa fa-pencil"></i></span>`;

        card.labels.forEach(label => {
          cardChunks += `<span class="trello-card-label my-1 mr-2" style="display: inline-block; background-color: ${label.color}"></span>`;
        })

        cardChunks += `
              <p>${card.title}</p>
                <div class="card-buttons d-flex flex-row ml-1 small">
                  <span class="mr-4"><i class="fas fa-align-justify"></i></span>
                  <span class="mr-4"><i class="fas fa-paperclip"></i> 1</span>
                  <span class="mr-4"><i class="fab fa-github"></i> 1</span>
                </div>
              </div>`;
      });
      currentList.setCards = cardChunks;
      currentList.setListTitle = list.title;
      currentList.setListId = list.id;
      currentList.setListStatus = list.status;
      currentList.setListPosition = list.position;
      currentList.createList();
    }
  });
  setup();
}

async function requestData() {
  try {
    isLoading(true);
    const response = await fetch(END_POINT + '/list', {
      method: 'GET',
      credentials: 'same-origin'
    })
    const data = await response.json();
    isLoading(false);
    return data;
  } catch (error) {
    isLoading(false);
    console.error(error);
  }
}

function List() { // CUSTOM OBJECT
  let listId, listTitle, listPosition, listStatus;
  const DISPLAY = document.getElementsByClassName("list-wrapper")[0];
  let cardChunks = '';

  this.createList = () => {
    DISPLAY.innerHTML += `
    <div class="card-list bg-dark pl-2 pr-2 py-2 mr-3 mb-2 align-self-start field-element" id="${this.listId}">
      <div class="list-head d-flex justify-content-between">
        <h5 class="">${this.listTitle}</h5>
        <span class="more-options-button small" onclick="openListMenu(this)">&bull;&bull;&bull;</span>
      </div>
      <div class="list-body">` +
      this.cardChunks +
      `
      </div>
      <div class="list-tail mt-2 ml-1 d-flex flex-row justify-content-between">
        <span class="list-tail-btn"><i class="fas fa-plus small"></i> Add Another Card</span>
        <span class="list-tail-btn"><i class="fas fa-file-export small"></i></span>
      </div>
    </div>`;
  }

  Object.defineProperties(this, {
    setCards: {
      set: function(_cardChunks) {
        this.cardChunks = _cardChunks;
      }
    },
    setListId: {
      set: function(_id) {
        this.listId = _id;
      }
    },
    setListTitle: {
      set: function(_listTitle) {
        this.listTitle = _listTitle;
      }
    },
    setListPosition: {
      set: function(_listPosition) {
        this.listPosition = _listPosition;
      }
    },
    setListStatus: {
      set: function(_listStatus) {
        this.listStatus = _listStatus;
      }
    },
    // etc. etc.
  });
}

const openListMenu = (el) => {
  modalClick(event); //  to prevent the trigger of window's modal hiding event
  let modal = document.getElementsByClassName("listmenu-modal")[0];
  modal.id = el.parentNode.parentNode.id;
  let bodyRect = document.body.getBoundingClientRect(),
    btnRect = el.getBoundingClientRect(),
    offsetL = btnRect.left - bodyRect.left,
    offsetT = btnRect.top - bodyRect.top,
    offsetR = btnRect.right - bodyRect.right;
  if (Math.abs(offsetR) <= 150) {
    offsetL -= 150 - Math.abs(offsetR);
  }
  offsetT += 30;
  modal.style.top = offsetT + "px";
  modal.style.left = offsetL + "px";
  if (modal.style.zIndex === "-999" && modal.style.opacity === "0") {
    modal.style.zIndex = "999";
    modal.style.opacity = "1";
  } else {
    modal.style.zIndex = "-999";
    modal.style.opacity = "0";
  }
}

const archiveList = (el) => {
  let confirm = window.confirm("The list will be archived. You can restore it later.");
  confirm ? archiveRequest(el.parentNode.id) : console.log("Action cancelled.");
}

async function archiveRequest(id) {
  try {
    isLoading(true);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${END_POINT}/list/${id}/status/2`, {
        method: 'PUT',
        headers: myHeaders,
      })
      .then(() => {
        isLoading(false);
        location.reload();
      });
  } catch (error) {
    isLoading(false);
    console.error(error);
  }
}

async function newListRequest(_title) {
  try {
    isLoading(true);
    let newList = JSON.stringify({
      "title": _title,
      "position": 4,
      "status": 1
    });
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${END_POINT}/list`, {
        method: 'POST',
        headers: myHeaders,
        body: newList
      })
      .then(() => {
        isLoading(false);
        location.reload();
      });
  } catch (error) {
    isLoading(false);
    console.error(error);
  }
}

const appendNewListBtn = () => {
  let wrapper = document.getElementsByClassName('list-wrapper')[0];
  wrapper.innerHTML += `
  <div class="align-self-start" style="border-right: 16px solid transparent; display: none;" id="newlist-field-wrapper" onclick="modalClick(event)">
  <div class="card-list bg-light text-dark px-2 py-1" id="newlist-field">
      <input type="text" name="newList" id="newListInput" value="" style="margin: auto;">
      <div class="d-flex flex-row mt-2 ml-1 py-1">
        <span class="newListAction list-tail-btn mr-2 text-light" onclick="createNewList()">Add List</span>
        <span class="newListAction list-tail-btn" onclick="closeNewList(this)"><i class="fa fa-close"></i></span>
      </div>
  </div>
  </div>`;
  wrapper.innerHTML += `
  <div class="align-self-start" style="border-right: 16px solid transparent; display: block;" id="newListBtn-wrapper">
  <div class="mt-2" onclick="openNewList(this)" id="newListBtn">
    <a class="w-100 px-2 field-element" href="#"><i class="fas fa-plus small"></i> Add Another List</a>
  </div>
  </div>`;
}

const openNewList = (el) => {
  modalClick(event); //  to prevent the trigger of window's modal hiding event
  document.getElementById("newListBtn-wrapper").style.display = "none";
  document.getElementById("newlist-field-wrapper").style.display = "block";
  document.getElementById("newListInput").focus();
}

const closeNewList = (el) => {
  modalClick(event);
  document.getElementById("newlist-field-wrapper").style.display = "none";
  document.getElementById("newListBtn-wrapper").style.display = "block";
}

const createNewList = () => {
  modalClick(event);
  let title = document.getElementById("newListInput").value.trim();
  if (title !== "") {
    newListRequest(title);
  } else {
    alert("The field must not be empty.")
  }
}

const isLoading = (_loading) => {
  let logo = document.getElementById("logo");
  let loader = document.getElementById("loader");
  if (_loading) {
    logo.style.display = "none";
    loader.style.display = "block";
  }
  else {
    logo.style.display = "block";
    loader.style.display = "none";
  }
}
