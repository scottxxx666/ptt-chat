const dbMode = {
  READ_ONLY: 'readonly',
  READ_WRITE: 'readwrite',
}

class IndexedDbRepo {
  blacklistTable = 'blacklist';
  userBlockedIndex = 'account';

  constructor(dbName) {
    this.dbName = dbName;
    this.db = null;
  }

  initDB = async () => {
    if (this.db) return this.db;
    console.log('this', this);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.blacklistTable)) {
          const store = db.createObjectStore(this.blacklistTable, {keyPath: 'id', autoIncrement: true});
          store.createIndex(this.userBlockedIndex, 'user', {unique: false});
          store.createIndex('user_blockedUser', ['user', 'blockedUser'], {unique: true});
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  };

  add = async (user, blockedUser) => {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.blacklistTable, dbMode.READ_WRITE);
      const store = transaction.objectStore(this.blacklistTable);
      const request = store.add({user, blockedUser});

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  all = async () => {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.blacklistTable, dbMode.READ_ONLY);
      const store = transaction.objectStore(this.blacklistTable);
      const request = store.getAll();

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  getBlacklist = async (user, blockedUser = null) => {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.blacklistTable, dbMode.READ_ONLY);
      const store = transaction.objectStore(this.blacklistTable);
      const index = store.index(blockedUser ? 'user_blockedUser' : this.userBlockedIndex);
      const range = blockedUser
        ? IDBKeyRange.only([user, blockedUser]) // Use compound key
        : IDBKeyRange.only(user);
      const results = [];
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = (event) => reject(event.target.error);
    });
  };

  delete = async id => {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.blacklistTable, dbMode.READ_WRITE);
      const store = transaction.objectStore(this.blacklistTable);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  };
}

export default IndexedDbRepo;
