window.onload = () => {
  const SERVER = "http://localhost:8080"
  let scriptName, btnSearch, result
  try {
    scriptName = document.getElementById('searchLoader')
    btnSearch = document.getElementById(scriptName.getAttribute('data-search'))
    result = document.getElementById(scriptName.getAttribute('data-result'))
  } catch (e) {
    console.debug('[DEBUG] Loader failed\n\n')
    throw e
  }

  /** Load custom css files and add them to the header*/
  setCss = (src) => {
    return new Promise((resolve, reject) => {
      let s = document.createElement('link')
      s.rel = 'stylesheet'
      s.href = src
      document.head.append(s)
      s.onload = resolve
      s.onerror = reject
    })
  }

  /**
  * Inserting our modal html before our script tag.
  * 
  * Please note: insertAdjacentHTML is faster than innerHTML because it does not reparse the element
  **/
  setHtmlModal = () => {
    const modalComponent = `
    <div class="modal">
      <div class="modalContent">
        <span class="closeBtn">&#215;</span>
        <span>Search</span><br />
        <input type="text" class="searchInput"/>
        <p>Terms:</p>
        <div class="treeView someOther"></div>
        <input type="button" value="Send" class="sendBtn"/>
      </div>
    </div>`

    scriptName.insertAdjacentHTML('beforebegin', modalComponent)
  }

  /** Load the search terms json from our server */
  getJsonFile = async () => {
    try {
      const response = await fetch(SERVER + '/terms')
      const searchJson = await response.json()
      return searchJson
    } catch (e) {
      console.error('[ERROR] Failed to load the terms')
      throw e
    }
  }

  /**
   * HELPER METHODS
   */
  /** Recursive way to flatten the whole object by terms if they exist
   * @param {object}  json
   * @param {array}   r - recursive list
   * @param {int}     i - index of the leafs
   */
  getParsedJson = (json, r, i) => {
    if (!i) {
      i = 0
    }
    if (!r) {
      r = []
    }

    if (json?.terms?.map) {
      json.terms.map(t => {
        if (t?.terms?.length) {
          r.push({ name: t.name, value: t.value, i }) // top level branch
          getParsedJson(t, r, i + 1)
        } else {
          r.push({ ...t, i }) // last leaf
        }
      })
    }

    return r
  }

  /** Custom sort by Object.value */
  const sortByValue = (a, b) => {
    if (a.value > b.value) return 1;
    if (a.value < b.value) return -1;
    return 0;
  }
  /**
   * END HELPER METHODS
   */


  /**
   * START EVENTS
   * Search event, do an API call for the search params and parse the json with the remaining data
   */
  const eventSearch = async (e) => {
    const searchValue = e.target.value
    let treeView = document.querySelector('.treeView')
    // must have at least 2 characters
    if (searchValue.length <= 2) {
      if (treeView.classList.contains('show-tree')) {
        treeView.classList.remove('show-tree')
      }
      return
    }

    // make the tree visible
    if (!treeView.classList.contains('show-tree')) {
      treeView.classList.add('show-tree')
    }

    const rawJson = await getJsonFile()
    const parsed = getParsedJson(rawJson)

    let treeViewList = ''
    const getFilteredResult = parsed.sort(sortByValue).filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase()))

    // If there are results availavble
    if (getFilteredResult.length > 0) {
      getFilteredResult.map(r => {
        treeViewList += `<div class="treeLeaf"><input type="checkbox" name="checkItem" value="0" data-cName="${r.name}" data-cValue="${r.value}" />`
        // add - for each level of the leaf
        for (i = 0; i < r.i; i++) {
          treeViewList += '<span class="treeLeafLevel">-</span>'
          if (i === r.i - 1) {
            treeViewList += ''
          }
        }
        treeViewList += r.name + '</div>'
      })

      treeView.innerHTML = treeViewList
    } else {
      treeView.innerHTML = 'No results found'
    }
  }

  const toggleModal = () => {
    const modal = document.querySelector('.modal')
    modal.classList.toggle('show-modal')
  }
  const windowOnClick = (e) => {
    const modal = document.querySelector('.modal')
    if (e.target === modal) {
      toggleModal()
    }
  }
  // Send each checked item back to the main textarea
  setEmptyResultError = () => {
    toggleModal()
    alert('No items selected')
    return
  }
  const eventSend = () => {
    const checkItem = document.getElementsByName('checkItem')
    if (checkItem.length == 0) {
      return setEmptyResultError()
    }

    let resultsList = []
    for (let i = 0; i < checkItem.length; i++) {
      if (checkItem[i].checked) {
        resultsList.push({
          name: checkItem[i].getAttribute('data-cName'),
          value: checkItem[i].getAttribute('data-cValue'),
        })
      }
    }
    if (resultsList.length == 0) {
      return setEmptyResultError()
    }
    result.innerHTML = JSON.stringify({ terms: resultsList })
    toggleModal()
  }

  /* Set on click events for the modal behaviour */
  setEvents = () => {
    const closeButton = document.querySelector('.closeBtn')
    const searchInput = document.querySelector('.searchInput')
    const sendBtn = document.querySelector('.sendBtn')

    btnSearch.addEventListener('click', toggleModal)
    closeButton.addEventListener('click', toggleModal)
    window.addEventListener('click', windowOnClick)
    sendBtn.addEventListener('click', eventSend)
    searchInput.addEventListener('keyup', eventSearch)
  }
  /**
   * END EVENTS
   */


  /**
    Loader setup, loads html and enables on click events 
  */
  const attachLoader = async () => {
    await setCss(SERVER + '/public/loader.css')   // css
    setHtmlModal()                                // html modal
    setEvents()                                   // click events
  }

  attachLoader()
}