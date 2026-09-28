import { useState, useEffect} from 'react'
import './App.css'

function App() {
 const [books, setBooks] = useState(() => {
  const savedBooks = localStorage.getItem('books')

  if (savedBooks) {
    return JSON.parse(savedBooks)
  }

  return [
    {
      id: 1,
      title: '嫌われる勇気',
      author: '岸見一郎・古賀史健',
      status: '読了',
      quotes: 8,
      quoteList: [],
    },
    {
      id: 2,
      title: '夢をかなえるゾウ',
      author: '水野敬也',
      status: '読書中',
      quotes: 5,
      quoteList: [],
    },
    {
      id: 3,
      title: '7つの習慣',
      author: 'スティーブン・R・コヴィー',
      status: '読了',
      quotes: 12,
      quoteList: [],
    },
  ]
})
const [selectedBook, setSelectedBook] = useState(null)
const [showAddForm, setShowAddForm] = useState(false)
const [newTitle, setNewTitle] = useState('')
const [newAuthor, setNewAuthor] = useState('')
const [searchResults, setSearchResults] = useState([])
const [newStatus, setNewStatus] = useState('読書中')
const [showEditForm, setShowEditForm] = useState(false)
const [editTitle, setEditTitle] = useState('')
const [editAuthor, setEditAuthor] = useState('')
const [editStatus, setEditStatus] = useState('読書中')
const [editFinishedDate, setEditFinishedDate] = useState('')
const searchBooks = async () => {
  if (!newTitle.trim()) {
    return
  }

  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(newTitle)}&limit=20`

  const response = await fetch(url)
  const data = await response.json()

 setSearchResults(
  (data.docs || [])
    .filter((book) => book.cover_i)
    .slice(0, 5)
)
}
useEffect(() => {
  localStorage.setItem('books', JSON.stringify(books))
}, [books])
const addBook = async () => {
  if (!newTitle.trim()) {
    alert('本のタイトルを入力してください')
    return
  }
const coverUrl = await getBookCover(newTitle, newAuthor)
  const newBook = {
    id: Date.now(),
    title: newTitle,
    author: newAuthor || '著者不明',
    status: newStatus,
    coverUrl: coverUrl,
    rating: 0,
    finishedDate: '',
    quotes: 0,
    quoteList: []
  }

  setBooks([...books, newBook])

  setNewTitle('')
  setNewAuthor('')
  setNewStatus('読書中')
  setShowAddForm(false)
}
const addQuote = () => {
  const quote = window.prompt('心に残ったフレーズを入力してください')

  if (!quote) {
    return
  }

  const updatedBooks = books.map((book) => {
  if (book.id === selectedBook.id) {
    return {
      ...book,
      quotes: book.quotes + 1,
quoteList: [...(book.quoteList || []), quote]
    }
  }

  return book
})

setBooks(updatedBooks)

const updatedSelectedBook = updatedBooks.find(
  (book) => book.id === selectedBook.id
)

setSelectedBook(updatedSelectedBook)
}

const deleteQuote = (index) => {
  const updatedBooks = books.map((book) => {
    if (book.id === selectedBook.id) {
      return {
        ...book,
       quotes: Math.max(0, book.quotes - 1),
        quoteList: book.quoteList.filter((_, i) => i !== index)
      }
    }

    return book
  })

  setBooks(updatedBooks)
  const updatedSelectedBook = updatedBooks.find(
  (book) => book.id === selectedBook.id
)

setSelectedBook(updatedSelectedBook)
}

const deleteBook = () => {
  const confirmed = window.confirm(
  `「${selectedBook.title}」を本当に削除しますか？`
)

if (!confirmed) {
  return
}
  const updatedBooks = books.filter(
    (book) => book.id !== selectedBook.id
  )

  setBooks(updatedBooks)
  setSelectedBook(null)
}
const saveEditBook = () => {
  if (!editTitle.trim()) {
    alert('本のタイトルを入力してください')
    return
  }

  const updatedBooks = books.map((book) => {
    if (book.id === selectedBook.id) {
      return {
        ...book,
        title: editTitle,
        author: editAuthor || '著者不明',
        status: editStatus,
        finishedDate:
  editStatus === '読了'
    ? editFinishedDate
    : ''
      }
    }

    return book
  })

  setBooks(updatedBooks)

  setSelectedBook({
    ...selectedBook,
    title: editTitle,
    author: editAuthor || '著者不明',
    status: editStatus,
finishedDate:
  editStatus === '読了'
    ? editFinishedDate
    : ''
  })

  setShowEditForm(false)
}
const setRating = (rating) => {
  const updatedBook = {
    ...selectedBook,
    rating: rating
  }

  const updatedBooks = books.map((book) =>
    book.id === selectedBook.id ? updatedBook : book
  )

  setBooks(updatedBooks)
  setSelectedBook(updatedBook)
}
  const totalQuotes = books.reduce((total, book) => {
  return total + (book.quoteList || []).length
}, 0)

  return (
    <main id="center">
      <p>MY READING LIBRARY</p>

      <h1>BookNote</h1>

      <button onClick={() => setShowAddForm(true)}>
  ＋ 本を追加
</button>
{showAddForm && (
  <div
  className="modal-overlay"
  onClick={() => setShowAddForm(false)}
>
    <div
  className="add-form"
  onClick={(e) => e.stopPropagation()}
>
    <h2>新しい本を追加</h2>

    <input
  type="text"
  placeholder="本のタイトル"
  value={newTitle}
  onChange={(e) => setNewTitle(e.target.value)}
/>
<button type="button" onClick={searchBooks}>
  🔍 本を検索
</button>
<div className="search-results">
  {searchResults.map((book) => (
    <div
      className="search-book"
      key={book.key}
    >
      {book.cover_i && (
        <img
          src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
          alt={book.title}
        />
      )}

      <p>{book.title}</p>
    </div>
  ))}
</div>

    <input
  type="text"
  placeholder="著者名"
  value={newAuthor}
  onChange={(e) => setNewAuthor(e.target.value)}
/>

    <select
  value={newStatus}
  onChange={(e) => setNewStatus(e.target.value)}
>
  <option value="読書中">読書中</option>
  <option value="読了">読了</option>
</select>

    <button onClick={addBook}>
  追加する
</button>

   <button onClick={() => setShowAddForm(false)}>
  キャンセル
</button>

    </div>
  </div>
)}

      <p>
        {books.length}冊登録した本
        <br />
        {totalQuotes}残したフレーズ
      </p>

      <h2>本棚</h2>
      <p>読んだ本と、心に残った言葉をまとめておこう。</p>

      <div>
        {books.map((book) => (
          <div
  className="book-card"
  key={book.id}
 onClick={() => {
  setSelectedBook(book)
  setShowEditForm(false)
}}
>
  {book.coverUrl && (
  <img
    src={book.coverUrl}
    alt={`${book.title}の表紙`}
    className="book-cover"
  />
)}
            <p>{book.status === '読了' ? '📘' : '📖'}</p>

            <h3>{book.title}</h3>

            <p>{book.author}</p>

            <p>心に残ったフレーズ {(book.quoteList || []).length}</p>

<p>
  評価：
  {book.rating
    ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating)
    : '未評価'}
</p>
            <p>{book.status}</p>
          </div>
        ))}
      </div>
      {selectedBook && (
  <div className="book-detail">
    <h2>{selectedBook.title}</h2>
    <p>{selectedBook.author}</p>
    <p>読書状況：{selectedBook.status}</p>
    {selectedBook.status === '読了' && selectedBook.finishedDate && (
  <p>読了日：{selectedBook.finishedDate}</p>
)}
    <div className="rating">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
  key={star}
  onClick={() => setRating(star)}
>
     {star <= (selectedBook.rating || 0) ? '★' : '☆'}
    </span>
  ))}
</div>
   <button
  onClick={() => {
    setEditTitle(selectedBook.title)
    setEditAuthor(selectedBook.author)
    setEditStatus(selectedBook.status)
    setEditFinishedDate(
  selectedBook.finishedDate ||
  new Date().toLocaleDateString('sv-SE')
)
    setShowEditForm(true)
  }}
>
  ✏️ 本の情報を編集
</button>
{showEditForm && (
  <div className="edit-form">
    <h3>本の情報を編集</h3>

    <input
  type="text"
  value={editTitle}
  onChange={(e) => setEditTitle(e.target.value)}
  placeholder="本のタイトル"
/>
    <input
  type="text"
  value={editAuthor}
  onChange={(e) => setEditAuthor(e.target.value)}
  placeholder="著者名"
/>

   <select
  value={editStatus}
  onChange={(e) => setEditStatus(e.target.value)}
>
      <option value="読書中">読書中</option>
      <option value="読了">読了</option>
    </select>
    {editStatus === '読了' && (
  <input
    type="date"
    value={editFinishedDate}
    onChange={(e) => setEditFinishedDate(e.target.value)}
  />
)}

<button onClick={saveEditBook}>
  保存
</button>
    <button onClick={() => setShowEditForm(false)}>
      キャンセル
    </button>
  </div>
)}

{(selectedBook.quoteList || []).map((quote, index) => (
  <p key={index}>
    ・{quote}
    <button onClick={() => deleteQuote(index)}>
      削除
    </button>
  </p>
))}
    <button onClick={addQuote}>
  ➕ フレーズを追加
</button>

<button onClick={() => setSelectedBook(null)}>
  戻る
</button>
<button onClick={deleteBook}>
  本を削除
</button>
  </div>
)}
    </main>
  )
}

export default App