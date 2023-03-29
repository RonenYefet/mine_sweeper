'use strict'

// const WALL = 'WALL'
// const FLOOR = 'FLOOR'
// const BALL = 'BALL'
// const GLUE = 'GLUE'
// const GAMER = 'GAMER'

// const GAMER_IMG = '<img src="img/gamer.png">'
// const GLUED_GAMER_IMG = '<img src="img/gamer-purple.png">'
// const BALL_IMG = '<img src="img/ball.png">'
// const GLUE_IMG = '<img src="img/candy.png">'

// const ADD_BALL_FREQ = 4000
// const ADD_GLUE_FREQ = 5000
// const REMOVE_GLUE_FREQ = 3000

const MINE = 'MINE'
const MINE_IMG = '<img src="img/gamer.png">'



// // Model:
// var gBoard
// var gGamerPos
// var gIsGameOn
// var gIsGamerGlued
// var gScore
// var gBallsCount
// var gBallInterval
// var gGlueInterval

var gBoard
var gLevel
var gGame
var minesLocation

function onInit() {
    gLevel = {
        SIZE: 4,
        MINES: 2
    }
    // gGamerPos = { i: 2, j: 9 }
    // gIsGameOn = true
    // gIsGamerGlued = false
    // gScore = 0
    // gBallsCount = 2
    minesLocation = minesRandomPlaces()
    gBoard = buildBoard()
    
    setMinesNegsCount()
    //countNeighbors(3,3,gBoard)
    renderBoard(gBoard)


    // // gBallInterval = setInterval(addBall, ADD_BALL_FREQ)
    // gGlueInterval = setInterval(addGlue, ADD_GLUE_FREQ)
    // updateScore()
    // hideModal()

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
                isMarked: false
            }
            // if (i === 0 || i === rowCount - 1 || j === 0 || j === colCount - 1) {
            //     board[i][j].type = WALL
            //  }
        }

    }
    //board[1][1].isMine = true
    //board[3][3].isMine = true
    return board
}



// // Render the board to an HTML table
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) + ' '
            cellClass += (currCell.isMine === true) ? 'mine' : 'empty'

            strHTML += `<td class="cell ${cellClass}" 
                      onclick="onCellClicked(this,${i},${j})" >`

            if (currCell.isMine) {
                strHTML += MINE_IMG
                // } else if (currCell.gameElement === BALL) {
                //     strHTML += BALL_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    // console.log('strHTML', strHTML)

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function isMineLocation(IndI, IndXJ) {
    for (var i = 0; i < minesLocation.length; i++) {
        if (minesLocation[i].i === IndI &&
            minesLocation[i].j === IndXJ) return true
    }
    return false
}

function onCellClicked(elCell, i, j) {
    if (gBoard[i][j].isMine) return
    renderCell({ i, j }, gBoard[i][j].minesAroundCount)

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