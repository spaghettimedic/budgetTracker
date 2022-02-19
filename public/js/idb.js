let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_trans', { autoIncrement: true });
};

function uploadTrans() {
  const transaction = db.transaction(['new_trans'], 'readwrite');
  const transObjectStore = transaction.objectStore('new_trans');
  const getAll = transObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(['new_trans'], 'readwrite');
        const transObjectStore = transaction.objectStore('new_trans');

        transObjectStore.clear();
        alert('All saved transactions have been submitted to the server!');
      })
      .catch(err => console.log(err));
    }
  }
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTrans();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

// this function will execute if there's no internet connection and a transaction is submitted by the client
function saveRecord(record) {
  const transaction = db.transaction(['new_trans'], 'readwrite');
  const transObjectStore = transaction.objectStore('new_trans');

  transObjectStore.add(record);
};

window.addEventListener('online', uploadTrans);
