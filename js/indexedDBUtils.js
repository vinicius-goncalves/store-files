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

function makeTransaction(objectStore, transactionType = 'readonly') {
    return dbPromise.then(db => {
        const transaction = db.transaction(objectStore, transactionType)
        const store = transaction.objectStore(objectStore)
        return store
    })
}

export function getItemByKey(keyId, callback) {
    makeTransaction(GENERAL_OBJ_STORE_NAME, 'readonly').then(store => {
        const query = store.get(keyId)
        query.addEventListener('success', (event) => {
            callback(event.target.result)
        })
    })
}

export function addItem(itemObj) {
    
    makeTransaction(GENERAL_OBJ_STORE_NAME, 'readwrite').then(store => {

        const query = store.put(itemObj)
        
        query.addEventListener('success', () => {
            console.log('Added')
        })

        query.addEventListener('error', (event) => {
            console.log(event)
        })
    })
}

export function putItem(itemObj, callback) {
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

export function getAllItems(callback) {
    makeTransaction(GENERAL_OBJ_STORE_NAME).then(store => {
        
        const query = store.getAll()

        query.addEventListener('success', (event) => {
            
            const items = event.target.result.map(item => {
                
                // const binaryArr = [...new Uint8Array(item.buffer)]
                // const arrays = []

                console.log(item)
                // const p1 = performance.now()
                // for(let i = 0; i < binaryArr.length; i += 1024) {
                    
                //     const chars = binaryArr.slice(i, i + 1024)
                //     const uint8Arr = new Uint8Array(chars.length)

                //     for(let i = 0; i < chars.length; i++) {
                //         uint8Arr[i] = chars[i]
                //     }

                //     arrays.push(uint8Arr)
                // }

                // const blob = new Blob(binaryArr, { type: item.type })

                // const newItem = {
                //     ...item,
                //     buffer: blob
                // }

                // console.log(newItem)

            })

            callback(event.target.result)
        })
    })
}