export { getItemByKey, addItem, putItem, getAllItems }

const DATABASE_NAME = 'files'
const STORE_VERSION = 1
const GENERAL_OBJ_STORE_NAME = 'file-obj-store'

const db = indexedDB.open(DATABASE_NAME, STORE_VERSION)

const dbPromise = new Promise(resolve => {
    
    db.addEventListener('success', (event) => {
        const dbResult = event.target.result
        resolve(dbResult)
    })
    
    db.addEventListener('upgradeneeded', (event) => {
        const dbResult = event.target.result 
        if(!dbResult.objectStoreNames.contains(GENERAL_OBJ_STORE_NAME)) {
            
            const store = dbResult.createObjectStore(GENERAL_OBJ_STORE_NAME, { keyPath: 'id' })
            store.createIndex('nameIndex', 'name', { unique: false })
            store.createIndex('idIndex', 'id', { unique: true })
        }
    })
})

async function makeTransaction(objectStore, transactionType = 'readonly') {

    const db = await dbPromise
    const transaction = db.transaction(objectStore, transactionType)
    const store = transaction.objectStore(objectStore)
    return store
}

async function getItemByKey(keyId) {

    const store = await makeTransaction(GENERAL_OBJ_STORE_NAME, 'readonly')

    const itemFound = new Promise(resolve => {
        const query = store.get(keyId)
        query.addEventListener('success', (event) => {
            resolve(event.target.result)
        })
    })

    return (await itemFound)
}

async function addItem(itemObj) {
    
    const store = await makeTransaction(GENERAL_OBJ_STORE_NAME, 'readwrite')
    const query = store.put(itemObj)

    const queryResult = {
        added: null,
        queryTimestamp: Date.now()
    }
    
    query.addEventListener('success', () => {

        Object.defineProperty(queryResult, 'added', { value: true, writable: true })
        console.log(queryResult)
    
    })

    query.addEventListener('error', () => {
        Object.defineProperty(queryResult, 'added', { value: false, writable: true })
        console.log(queryResult)
    })
}

function putItem(itemObj, callback) {
    getItemByKey(itemObj.id, itemFound => {
        if(itemFound) {
            return callback('Already exists')
        }

            makeTransaction(GENERAL_OBJ_STORE_NAME, 'readwrite').then(store => {

            const newItemObj = {
                ...itemObj,
                buffer: new Blob([itemObj.buffer], { type: itemObj.type })
            }
            
            const query = store.put(newItemObj)
            query.addEventListener('success', (event) => {
                
                const successObj = {
                    created: true,
                    keyId: event.target.result
                }

                callback(successObj)

            })
        })
    })
}

async function getAllItems() {

    const store = await makeTransaction(GENERAL_OBJ_STORE_NAME)
    const query = store.getAll()

    const allItems = new Promise(resolve => {
        query.addEventListener('success', ({ target }) => {
            resolve(target.result)
        })
    })

    return allItems

}