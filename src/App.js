import React      from 'react';
// import PropTypes  from 'prop-types';
import './App.css';

const win_conditions = [
      [0,1,2,],
      [3,4,5,],
      [6,7,8,],
      [0,3,6,],
      [1,4,7,],
      [2,5,8,],
      [0,4,8,],
      [2,4,6,], ];

const all_positions = [
      0,1,2,
      3,4,5,
      6,7,8,  ];

const timeOut_value = 1000; // [ms]

class App extends React.Component{
  render (){
    return (
      <Game/>
    );
  } // end - render
} // end - App

class Game extends React.Component{
  
  constructor(){
    super();
    this.state = {
      board       : Array(9).fill(null),
      is_p1Turn   : true,
      is_comTurn  : false,
      score : {
        ply1 :0,
        ply2 :0,
      },
    }; // end - state
    this.update_position  = this.update_position.bind (this);
    this.add_score        = this.add_score.bind       (this);
    this.change_turn      = this.change_turn.bind     (this);
    this.check_Winner     = this.check_Winner.bind    (this);
    this.check_draw       = this.check_draw.bind      (this);
    this.reset_game       = this.reset_game.bind      (this);
    this.highligh_path    = this.highligh_path.bind   (this);
    this.new_game         = this.new_game.bind        (this);
    this.com_move         = this.com_move.bind        (this);
    this.usr_move         = this.usr_move.bind        (this);
    this.game_eval        = this.game_eval.bind       (this);
  } // end - constructor
  
  update_position(pos, callback=()=>{}){
    console.log("update_position called");
    let new_board = this.state.board.slice();
    (this.state.is_p1Turn?new_board[pos]='1':new_board[pos]='2');
    this.setState({board: new_board}, callback);
  } // end - updade board
  
  add_score(){
    console.log("add_score called");
    this.setState({
      score: {
        ply1: (this.state.is_p1Turn?this.state.score.ply1+1:this.state.score.ply1  ),
        ply2: (this.state.is_p1Turn?this.state.score.ply2  :this.state.score.ply2+1),
      },
    });
  } // end - add_score
  
  change_turn(change_comTurn=false, callback=()=>{}){
    console.log('change_turn called');
    this.setState(
      {
        is_p1Turn : !this.state.is_p1Turn,
        is_comTurn: (change_comTurn?!this.state.is_comTurn:this.state.is_comTurn),
      },
      callback
    );
  } // end - change_turn
  
  check_Winner(){
    console.log("check_Winner: called");
    var path = win_conditions.findIndex(function(elem){
      return elem.every(function(curr, index, array){
        // console.log(curr, this.state.board[curr]);
        if (this.state.board[curr])
          return (this.state.board[curr] === this.state.board[array[0]]);
        return false;
      }, this); // end - every position on path
    }, this); // end - findIndex
    return path;
  } // end - check_Winner
  
  check_draw(){
    console.log("check_draw: called");
    return all_positions.every(function(curr){
      return this.state.board[curr];
    }, this);
  } // end - check_draw
  
  reset_game(callback=()=>{}){
    console.log("reset_game called");
    this.setState(
      {board: Array(9).fill(null)},
      callback
    );
  } // end - reset_game
  
  highligh_path(path, callback=()=>{}){
    console.log("highligh_path called");
    let new_board = this.state.board.slice();
    path.forEach(function(elem){
      new_board[elem] = '3';
    }, this);
    this.setState(
      {board: new_board},
      callback
    );
  }
  
  new_game(){
    console.log("new_game called");
    this.setState({
      board : Array(9).fill(null),
      score :{
        ply1: 0,
        ply2: 0,
      },
      is_comTurn: false,
    }, this.change_turn);
  } // end - new_game
  
  com_move(callback=()=>{}){
    console.log("com_move called");
    console.log()
    if (this.state.is_comTurn){
      let possible_moves = all_positions.filter(function(position){
        if (this.state.board[position]) return false;
        return true;
      }, this);
      let move_choice = parseInt(Math.random()*possible_moves.length, 10);
      this.update_position( possible_moves[move_choice], callback); // end - update_position
    } // if - this.state.is_comTurn
  } // end - com_plays
  
  usr_move(pos, callback=()=>{}){
    console.log("usr_move called");
    if (!this.state.is_comTurn){
      this.update_position( pos, callback); // end - update_position
    } // if - this.state.is_comTurn
  } // end - com_plays
  
  game_eval(callback=()=>{}){ // handles move evaluation - call after every single move
    console.log("game_eval called");
    console.log(this.state);
    let path_num = this.check_Winner();
    if( path_num !==-1){
      console.log('winner');
      this.highligh_path( win_conditions[path_num], ()=>{
        setTimeout( ()=>{
          this.add_score();
          this.reset_game(()=>{
            this.change_turn(true, callback);
          });
          // this.change_turn(true, com_move );
        },timeOut_value);
      }); // end - highligh_path
    } // handles winner
    else if( this.check_draw() ){
      console.log('draw');
      this.highligh_path( all_positions, ()=>{
        setTimeout(()=>{
          this.reset_game(()=>{
            this.change_turn(true, callback);
          });
        }, timeOut_value);
      });
    } // handles draw
    else{
      this.change_turn(true, callback);
    } // handles game proceed
  } // end - game_eval
  
  render(){
    let handleClick = (pos)=>{
      if (!this.state.is_comTurn){
        this.usr_move(pos, ()=>{
          this.game_eval(()=>{
            this.com_move(()=>{
              this.game_eval();
            });
          });
        }); // end - update_position
      } // if - is_comTurn
    } // end - handleClick
    return(
      <div className='game flex-col'>
        <GameMenu
          score     = {this.state.score}
          is_p1Turn = {this.state.is_p1Turn}
          new_game  = {this.new_game}
        />
        <GameBoard
          board       = {this.state.board}
          handleClick = {handleClick}
        />
      </div>
    );
  } // end - render
  
} // end - game

class GameBoard extends React.Component{
  
  render(){
    let handleClick = this.props.handleClick;
    return(
      <div className='game-board flex-row wrap'>
        {
          this.props.board.map(function(elem, index){
          return (
            <BoardPosition
              key={'pos'.concat( index.toString() )}
              is_clicked={elem}
              onClick={
                (elem ? ()=>{             }
                      : ()=>{
                    handleClick(index);   }    ) /*end ternaryOp*/
              } /*end onClick*/
            /> );
        }) /*end - map javascript*/ }
      </div>
    ); // render return
  } // end - render
  
} // end - gameBoard

class BoardPosition extends React.Component{
  render(){
    let button_class;
    switch(this.props.is_clicked){
      case '1':
        button_class = ' button-p1';
        break;
      case '2':
        button_class = ' button-p2';
        break;
      case '3':
        button_class = ' button-high';
        break;
      default:
        button_class = ' button-idle';
        break;
    }
    return (
      <div
        className   = { 'button'+ button_class  }
        onClick     = { this.props.onClick      }
      ></div>)
  } // end - render
} // end - buttons

class GameMenu extends React.Component{
  
  render(){
    return(
      <div className='game-menu app-font flex-row'>
        <div className={ 'flex-col'+(this.props.is_p1Turn?' player-turn':'') }>
          <div>Player 1</div>
          <div>{this.props.score.ply1}</div>
        </div>
        <div className='new-game flex-row' onClick={this.props.new_game}>
          New Game
        </div>
        <div className={ 'flex-col'+(this.props.is_p1Turn?'':' player-turn') }>
          <div>Player 2</div>
          <div>{this.props.score.ply2}</div>
        </div>
      </div>
    );
  } // end - render
  
} // end - gameMenu
  
export default App;