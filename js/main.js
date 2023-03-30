'use strict'

const MARKED = 'MARKED'
const MARKED_IMG = '🚩'
const MINE_IMG = '<img src="img/mine_bomb2.png">'
const NORMAL = '😃'
const LOSE = '🤯'
const WINE = '😎'
const EMPTY = 'empty'

var gBoard
var gLevel
var gGame
var minesLocation
var livesLeftCounter
var buttonLevelPressed
var gTimerIntervalId

function onInit() {
    clearInterval(gTimerIntervalId)
    if (!buttonLevelPressed) createLevel(4, 2)
    createGame()
    setRestartButton(NORMAL)
    livesLeftCounter = (gLevel.MINES >2) ? 3 : 1

    setLivesLeft()
    setTimerText()
    minesLocation = minesRandomPlaces()
    gBoard = buildBoard()

    setTimerText(0)
    setMinesNegsCount()
    renderBoard(gBoard)
    avoidRightClickedDefault()
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: isMineLocation(i, j) ? true : false,
                isMarked: false
            }
        }

    }
    return board
}



//Render the board to an HTML table
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) + ' '
            cellClass += EMPTY
            strHTML += `<td class="cell ${cellClass}" 
                      onclick="onCellClicked(this,${i},${j})" 
                      oncontextmenu="onCellMarked(this,${i},${j})">`
            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

//Render the board to an HTML table
function renderBlowUpBoard() {
    for (var i = 0; i < minesLocation.length; i++) {
        (renderCell(minesLocation[i], MINE_IMG))
    }
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gGame.secsPassed === 0) startTimer()
    const cell = gBoard[i][j]
    if (cell.isShown) return

    const minesAroundCount = gBoard[i][j].minesAroundCount

    if (gBoard[i][j].isMine) {
        handleMine()
        gBoard[i][j].isShown = true
        renderCell({ i, j }, MINE_IMG)
    } else if (minesAroundCount > 0) {
        gBoard[i][j].isShown = true
        renderCell({ i, j }, minesAroundCount)
        shownCell(elCell)
        updateShownCounter(1)        
    } else {
        gBoard[i][j].isShown = true
        expandShown(gBoard, elCell, i, j)
        shownCell(elCell)
    }
    if (checkGameOver()) gameOver()
}

function handleMine() {
    livesLeftCounter--
    setLivesLeft()
    updateShownCounter(1)
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gGame.secsPassed === 0) startTimer()

    const cell = gBoard[i][j]
    if (cell.isShown) return

    var cellText = ''
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        updateMarkedCounter(-1)
    } else {
        gBoard[i][j].isMarked = true
        updateMarkedCounter(1)
        cellText = MARKED_IMG
        if (checkGameOver()) gameOver()
    }
    renderCell({ i, j }, cellText)
}



function isMineLocation(IndI, IndXJ) {
    for (var i = 0; i < minesLocation.length; i++) {
        if (minesLocation[i].i === IndI &&
            minesLocation[i].j === IndXJ) return true
    }
    return false
}


function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = getMinesNegsCount(i, j)
        }
    }

}
function getMinesNegsCount(cellI, cellJ) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}
function expandShown(gBoard, elCell, cellI, cellJ) {
    var shownCount = 1//the field it self
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown &&
                !gBoard[i][j].isMarked) {
                const minesAroundCount = gBoard[i][j].minesAroundCount
                gBoard[i][j].isShown = true
                shownCount++
                exposeShownCell({ i, j })
                renderCell({ i, j }, (minesAroundCount === 0) ? '' : minesAroundCount)
            }
        }
    }
    updateShownCounter(shownCount)

}

function minesRandomPlaces() {
    const cells = []
    const minesPlace = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = { i, j }
            cells.push(cell)
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        minesPlace[i] = getRandomLocation(cells)
    }
    return minesPlace
}

function getRandomLocation(cells) {
    var randIdx = getRandomInt(0, cells.length)
    var location = cells[randIdx]
    cells.splice(randIdx, 1)
    return location
}



function updateShownCounter(diff) {
    gGame.shownCount += diff
}

function updateMarkedCounter(diff) {
    gGame.markedCount += diff
}

function checkGameOver() {
    return (isVictory()
        || !isliveLeft())
}
function isVictory() {
    return (gGame.markedCount + gGame.shownCount) === gLevel.SIZE ** 2
}
function isliveLeft() {
    return (livesLeftCounter >= 0)
}

function gameOver() {
    var emojy = (isVictory()) ? WINE : LOSE
    setRestartButton(emojy)
    if (!isVictory()) renderBlowUpBoard()
    clearInterval(gTimerIntervalId)
    gGame.isOn = false
}

function onChangeLevel(size, mines) {
    createLevel(size, mines)
    buttonLevelPressed = true
    onInit()
}
function setRestartButton(emojy) {
    const elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.innerHTML = emojy
}

function startTimer() {
    var startTime = Date.now()
    const elTimer = document.querySelector('.timer')
    gTimerIntervalId = setInterval(() => {
        const diff = Date.now() - startTime
        gGame.secsPassed = diff
        setTimerText((Math.floor(diff / 1000)))
    }, 1000)
}

function setTimerText(time = 0) {
    const elTimer = document.querySelector('.timer')
    elTimer.innerText = time
}
function setLivesLeft() {
    const elLiveLeft = document.querySelector('.lives-left')
    elLiveLeft.innerText = (isliveLeft()) ? livesLeftCounter : 0
}
function shownCell(elCell) {
    elCell.classList.remove(EMPTY)
    elCell.classList.add('shown')
}

function exposeShownCell(location) {
    const cellSelector = getClassName(location)
    const elCell = document.querySelector('.' + cellSelector)
    shownCell(elCell)
}

function createLevel(size, mines) {
    gLevel = {
        SIZE: size,
        MINES: mines
    }
}
function createGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
}

