const bookData = []
let filteredBookData = []
const RENDER_BOOK_LIST_EVENT = "render-book-list-event"
const RENDER_SEARCH_BOOKS_EVENT = "render-search-books-event"
const STORAGE_KEY = "BOOKSHELF_APP"
const SAVED_EVENT = "saved_books"
const getBooksData = localStorage.getItem(STORAGE_KEY)
const searchForm = document.getElementById("form-search-book")
const submitForm = document.getElementById("form-book-input")
const expandList = document.querySelectorAll(".expand")
const filteredBookList = document.getElementById("filtered-books")
const searchBookTitle = document.getElementById("search-book-title")
const searchBtn = document.getElementById("search-btn")
const itemCount = document.getElementById("item-info")
const unreadBooks = document.getElementById("unread-books")
const readBooks = document.getElementById("read-books")
const upBtn = document.getElementById("scroll-to-top-btn")
let parsedData = JSON.parse(getBooksData)
let isRead = false
let unreadStateCount = 0
let readStateCount = 0

document.addEventListener("DOMContentLoaded", () => {
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault()
        addBook()
    })
    if (isStorageExist()) {
        loadDataFromStorage()
    }
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault()
        searchBookList()
    })
    searchBtn.addEventListener("click", () => {
        searchBookList()
    })
})

const isStorageExist = () => {
    if (typeof (Storage) == null || typeof (Storage) == undefined) {
        alert("Your browser doesn't support local storage!")
        return
    }
    return true
}

const generateId = () => +new Date()

const saveData = () => {
    if (isStorageExist()) {
        const stringData = JSON.stringify(bookData)
        localStorage.setItem(STORAGE_KEY, stringData)
    }
}

const addBook = () => {
    const bookId = generateId()
    const bookTitle = document.getElementById("book-title").value
    const bookAuthor = document.getElementById("book-author").value
    const bookYear = document.getElementById("book-year").value
    const isChecked = document.getElementById("book-is-read").checked
    if (isChecked) {
        isRead = true
    } else {
        isRead = false
    }
    const bookObj = {
        bookId,
        bookTitle,
        bookAuthor,
        bookYear,
        isRead
    }
    bookData.push(bookObj)
    document.dispatchEvent(new Event(RENDER_BOOK_LIST_EVENT))
    document.dispatchEvent(new Event(SAVED_EVENT))
    saveData()
}

const loadDataFromStorage = () => {
    if (parsedData == null) return
    else {
        parsedData.forEach(book => {
            bookData.push(book)
        })
    }
    document.dispatchEvent(new Event(RENDER_BOOK_LIST_EVENT))
}

document.addEventListener(SAVED_EVENT, () => {
    const lastSavedBookTitle = bookData[bookData.length - 1].bookTitle
    const lastSavedBookAuthor = bookData[bookData.length - 1].bookAuthor
    const lastSavedBookYear = bookData[bookData.length - 1].bookYear
    alert(`Berhasil menyimpan buku:\nJudul\t:${lastSavedBookTitle}\nPenulis\t:${lastSavedBookAuthor}\nTahun\t:${lastSavedBookYear}`)
})

const searchBookList = () => {
    const titleValue = searchBookTitle.value.toLowerCase()
    if (titleValue == "" || titleValue == null || titleValue == undefined) {
        filteredBookList.innerHTML = ""
        itemCount.innerText = "Cari buku yang ada di dalam rak"
    }
    else {
        filteredBookData = bookData.filter(bookItem => bookItem.bookTitle.toLowerCase().includes(titleValue))
        if (filteredBookData.length > 0) {
            itemCount.innerText = `Ditemukan: ${filteredBookData.length}`            
        } else {
            itemCount.innerText = "Buku yang dicari tidak ditemukan"
        }
        document.dispatchEvent(new Event(RENDER_SEARCH_BOOKS_EVENT))
    }
}

const findBook = bookId => {
    for (const bookItem of bookData) {
        if (bookItem.bookId == bookId) return bookItem
    }
    return null
}

const addBookToRead = bookId => {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return
    bookTarget.isRead = true
    document.dispatchEvent(new Event(RENDER_BOOK_LIST_EVENT))
    document.dispatchEvent(new Event(RENDER_SEARCH_BOOKS_EVENT))
    saveData()
}

const findBookIndex = bookId => {
    for (const index in bookData) {
        if (bookData[index].bookId == bookId) return index
    }
    return -1
}

const undoBookFromRead = bookId => {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return
    bookTarget.isRead = false
    with(document) {
        dispatchEvent(new Event(RENDER_BOOK_LIST_EVENT))
        dispatchEvent(new Event(RENDER_SEARCH_BOOKS_EVENT))
    }
    saveData()
}

const deleteBook = bookObj => {
    const bookTarget = findBookIndex(bookObj.bookId)
    if (bookTarget == -1) return
    const isAlertDialogConfirmed = confirm(`Apakah Anda ingin menghapus buku "${bookObj.bookTitle}"?`)
    if (isAlertDialogConfirmed) {
        bookData.splice(bookTarget, 1)
        searchBookList()
        document.dispatchEvent(new Event(RENDER_BOOK_LIST_EVENT))
        saveData()
        alert("Buku berhasil dihapus")
    }
}

const createBookList = (bookObj) => {
    const textTitle = document.createElement("h4")
    textTitle.innerText = bookObj.bookTitle
    const table = document.createElement("table")
    const tbody = document.createElement("tbody")
    table.appendChild(tbody)
    const authorRow = document.createElement("tr")
    const yearRow = document.createElement("tr")
    with(authorRow) {
        innerHTML = "<td>Penulis</td>"
        innerHTML += "<td>:</td>"
        innerHTML += `<td>${bookObj.bookAuthor}</td>`
    }
    with(yearRow) {
        innerHTML = "<td>Tahun</td>"
        innerHTML += "<td>:</td>"
        innerHTML += `<td>${bookObj.bookYear}</td>`
    }
    tbody.append(authorRow, yearRow)
    const itemContainer = document.createElement("div")
    itemContainer.classList.add("inner")
    itemContainer.append(textTitle, table)

    if (!bookObj.isRead) {
        const readBtn = document.createElement("button")
        readBtn.classList.add("read-btn")
        readBtn.innerText = "Tandai selesai dibaca"
        readBtn.addEventListener("click", () => {
            addBookToRead(bookObj.bookId)
        })
        itemContainer.append(readBtn)
    } else {
        const undoBtn = document.createElement("button")
        undoBtn.classList.add("undo-btn")
        undoBtn.innerText = "Batalkan selesai dibaca"
        undoBtn.addEventListener("click", () => {
            undoBookFromRead(bookObj.bookId)
        })
        itemContainer.append(undoBtn)
    }
    const deleteBtn = document.createElement("button")
    with(deleteBtn) {
        classList.add("delete-btn")
        innerText = "Hapus Buku"
        addEventListener("click", () => {
            deleteBook(bookObj)
        })
    }
    itemContainer.append(deleteBtn)
    return itemContainer
}

expandList[0].addEventListener("click", () => {
    const setDropDownImg = document.getElementById("unread-drop-down")
    unreadStateCount++
    if (unreadStateCount == 1) {
        setDropDownImg.setAttribute("src", "assets/images/collapse.svg")
        unreadBooks.removeAttribute("hidden")
    } else {
        unreadStateCount = 0
        setDropDownImg.setAttribute("src", "assets/images/expand.svg")
        unreadBooks.setAttribute("hidden", true)
    }
})

expandList[1].addEventListener("click", () => {
    const setDropDownImg = document.getElementById("read-drop-down")
    readStateCount++
    if (readStateCount == 1) {
        setDropDownImg.setAttribute("src", "assets/images/collapse.svg")
        readBooks.removeAttribute("hidden")
    } else {
        readStateCount = 0
        setDropDownImg.setAttribute("src", "assets/images/expand.svg")
        readBooks.setAttribute("hidden", true)
    }
})

const filterBookList = bookObj => {
    const textTitle = document.createElement("h4")
    textTitle.innerText = bookObj.bookTitle
    const itemContainer = document.createElement("div")
    itemContainer.classList.add("inner")
    const table = document.createElement("table")
    const tbody = document.createElement("tbody")
    const authorRow = document.createElement("tr")
    const yearRow = document.createElement("tr")
    const readInfoRow = document.createElement("tr")
    with(authorRow) {
        innerHTML = "<td>Penulis</td>"
        innerHTML += "<td>:</td>"
        innerHTML += `<td>${bookObj.bookAuthor}</td>`
    }
    with(yearRow) {
        innerHTML = "<td>Tahun</td>"
        innerHTML += "<td>:</td>"
        innerHTML += `<td>${bookObj.bookYear}</td>`
    }
    readInfoRow.innerHTML = "<td>Keterangan</td>"
    readInfoRow.innerHTML += "<td>:</td>"
    if (bookObj.isRead) {
        readInfoRow.innerHTML += "<td>Selesai dibaca</td>"
    } else {
        readInfoRow.innerHTML += "<td>Belum selesai dibaca</td>"
    }
    table.appendChild(tbody)
    tbody.append(authorRow, yearRow, readInfoRow)
    itemContainer.append(textTitle, table)
    return itemContainer
}

document.addEventListener(RENDER_BOOK_LIST_EVENT, function () {
    const unreadBookList = document.getElementById("unread-books")
    unreadBookList.innerHTML = ""
    const readBookList = document.getElementById("read-books")
    readBookList.innerHTML = ""
    bookData.forEach(bookItem => {
        const bookElement = createBookList(bookItem)
        if (!bookItem.isRead) unreadBookList.append(bookElement)
        else readBookList.append(bookElement)
    })
})

document.addEventListener(RENDER_SEARCH_BOOKS_EVENT, () => {
    filteredBookList.innerHTML = ""
    filteredBookData.forEach(filteredItem => {
        const filteredBook = filterBookList(filteredItem)
        filteredBookList.append(filteredBook)
    })
})

const scrollToTop = () => {
    upBtn.addEventListener("click", function (event) {
        const target = document.querySelector("header")
        event.preventDefault()
        target.scrollIntoView({
            behavior: "smooth"
        })
    })
}

document.addEventListener("scroll", () => {
    if (pageYOffset >= 400) {
        upBtn.style.display = "block"
        scrollToTop()
    } else {
        upBtn.style.display = "none"
    }
})