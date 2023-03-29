'use strict'

const MINE = 'MINE'
const MARKED = 'MARKED'
const MARKED_IMG = '<img src="img/marked.png">'
const MINE_IMG = '<img src="img/mine.png">'
const NORMAL = '&#128516;'
const LOSE = '&#128538;'
const WINE = '&#128525;'
const EMPTY = 'empty'

var gBoard
var gLevel
var gGame
var minesLocation
var livesLeftCounter
var buttonLevelPressed

function onInit() {
    if (!buttonLevelPressed) {
        gLevel = {
            SIZE: 4,
            MINES: 2
        }
    }
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    setRestartButton(NORMAL)
    livesLeftCounter = 1
    setLivesLeft()
    minesLocation = minesRandomPlaces()
    gBoard = buildBoard()

    setMinesNegsCount()
    renderBoard(gBoard)
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: isMineLocation(i,j) ? true : false,
                //isMine: false,
                isMarked: false
            }            
        }

    }
    //board[1][1].isMine = true
    //board[3][3].isMine = true
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
            //cellClass += (currCell.isMine === true) ? 'mine' : 'empty'
            cellClass += EMPTY
            strHTML += `<td class="cell ${cellClass}" 
                      onclick="onCellClicked(this,${i},${j})" 
                      oncontextmenu="onCellMarked(this,${i},${j})">`
            // if (currCell.isMine) {
            //     strHTML += MINE_IMG
            //     // } else if (currCell.gameElement === BALL) {
            //     //     strHTML += BALL_IMG
            // }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    // console.log('strHTML', strHTML)

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

//Render the board to an HTML table
function renderBlowUpBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) + ' '
            //cellClass += (currCell.isMine === true) ? 'mine' : 'empty'
            cellClass += EMPTY
            strHTML += `<td class="cell ${cellClass}" 
                      onclick="onCellClicked(this,${i},${j})" 
                      oncontextmenu="onCellMarked(this,${i},${j})">`
            if (currCell.isMine) {
                strHTML += MINE_IMG
            } else if (board[i][j].minesAroundCount > 0) {
                strHTML += board[i][j].minesAroundCount
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    // console.log('strHTML', strHTML)

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (gBoard[i][j].isMine) {
        handleMine()
        return
    }
    const minesAroundCount = gBoard[i][j].minesAroundCount
    if (minesAroundCount > 0) {
        gBoard[i][j].isShown = true
        updateShownCounter(1)
        renderCell({ i, j }, minesAroundCount)
    } else {
        expandShown(gBoard, elCell, i, j)
    }
    if (checkGameOver()) gameOver()
}

function handleMine() {
    livesLeftCounter--
    setLivesLeft()
    if (checkGameOver()) {
        console.log('Game over')
        gameOver()
    }
}

function onCellMarked(elCell, i, j) {
    console.log('right clicked')
    const cell = gBoard[i][j]
    if (cell.isShown) return
    //getClassName()
    //const div = document.getElementById("cell-0-3");
    //div.addEventListener("contextmenu", (e) => {

    //      console.log('right clicked')
    //         e.preventDefault()
    //  });
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
    var shownCount = 1
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown &&
                !gBoard[i][j].marked) {
                const minesAroundCount = gBoard[i][j].minesAroundCount
                gBoard[i][j].isShown = true
                shownCount++
                renderCell({ i, j }, minesAroundCount)
            }
        }
    }
    updateShownCounter(shownCount)

}

function minesRandomPlaces() {
    const array = []
    const minesPlace = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = { i, j }
            array.push(cell)
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        minesPlace[i] = getRandomLocation(array)
    }
    return minesPlace
}

function getRandomLocation(array) {
    var randIdx = getRandomInt(0, array.length)
    var location = array[randIdx]
    array.splice(randIdx, 1)
    return location
}

function setLivesLeft() {
    const elMinLeft = document.querySelector('.lives-left')
    const elSpan = elMinLeft.querySelector('span')
    elSpan.innerText = livesLeftCounter
}

function updateShownCounter(diff) {
    gGame.shownCount += diff
}

function updateMarkedCounter(diff) {
    gGame.markedCount += diff
}

function checkGameOver() {
    return (isVictory()
        || livesLeftCounter === 0)
}
function isVictory() {
    return (gGame.markedCount + gGame.shownCount) === gLevel.SIZE ** 2
}

function gameOver() {
    var emojy = (isVictory()) ? WINE : LOSE
    setRestartButton(emojy)
    if (!isVictory()) renderBlowUpBoard(gBoard)
}

function onChangeLevel(size, mines) {
    gLevel = {
        SIZE: size,
        MINES: mines
    }
    buttonLevelPressed = true
    onInit()
}
function setRestartButton(emojy) {
    const elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.innerHTML = emojy
}
