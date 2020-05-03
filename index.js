/* eslint-disable eslint-comments/no-unused-disable */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  StatusBar,
  Text,
  View,
  Alert,
  BackHandler,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import {GameEngine, dispatch} from 'react-native-game-engine';
import {Head} from './head';
import {Food} from './food';
import {Tail} from './tail';
import {GameLoop} from './systems';
import Constants from './Constants';

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.boardSize = Constants.GRID_SIZE * Constants.CELL_SIZE;
    this.engine = null;
    this.state = {
      running: true,
      score: 0,
      visible: false,
      onFocused: true,
      name: '',
    };
  }

  exitApp = () => {
    this.setState({running: false});

    Alert.alert('Hold on!', 'Are you sure you want to Exit?', [
      {
        text: 'Cancel',
        onPress: () => this.setState({running: false, visible: true}),
        style: 'cancel',
      },
      {text: 'YES', onPress: () => BackHandler.exitApp()},
    ]);
    return true;
  };
  backAction = () => {
    this.setState({running: false});

    Alert.alert('Hold on!', 'Are you sure you want to Exit?', [
      {
        text: 'Cancel',
        onPress: () => this.setState({running: true}),
        style: 'cancel',
      },
      {text: 'YES', onPress: () => BackHandler.exitApp()},
    ]);
    return true;
  };

  componentDidMount() {
    const {name} = this.state;
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    this.modal(true, name);
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }
  modal = (obj, namee) => {
    if (obj === false && namee === '') {
      Alert.alert('Please Enter Username!');
      this.setState({
        visible: true,
        running: false,
      });
    } else if (obj === false && namee != '') {
      this.setState({
        visible: false,
        running: true,
      });
    } else if (obj === true && namee === '') {
      this.setState({
        visible: true,
        running: false,
      });
    }
  };
  stdModalVisible = (show) => {
    this.setState({visible: show});
  };
  randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  onEvent = (e) => {
    const {score} = this.state;
    if (e.type === 'game-over') {
      this.setState({
        running: false,
      });
      Alert.alert('Hold on!', 'what do you want?', [
        {
          text: 'Exit',
          onPress: () => BackHandler.exitApp(),
        },
        {text: 'Restart', onPress: () => this.reset()},
      ]);
    } else if (e.type === 'score+') {
      var s = score + 1;
      this.setState({
        score: s,
      });
    }
  };

  reset = () => {
    this.engine.swap({
      head: {
        position: [0, 0],
        xspeed: 1,
        yspeed: 0,
        nextMove: 10,
        updateFrequency: 10,
        size: 20,
        renderer: <Head />,
      },
      food: {
        position: [
          this.randomBetween(0, Constants.GRID_SIZE - 1),
          this.randomBetween(0, Constants.GRID_SIZE - 1),
        ],
        size: 20,
        renderer: <Food />,
      },
      tail: {size: 20, elements: [], renderer: <Tail />},
    });
    this.setState({
      running: true,
      score: 0,
    });
  };
  handleFocuse = () => {
    this.setState({onFocused: true});
  };
  handleBlur = () => {
    this.setState({onFocused: false});
  };

  render() {
    const {score, name} = this.state;
    return (
      <View style={styles.container}>
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.state.visible}
          onRequestClose={() => {
            this.exitApp();
          }}>
          <View style={styles.stdModalMainView}>
            <Text style={styles.modalHaderTxt}>Select Username</Text>
            <TextInput
              onChangeText={this.handleFocuse}
              onTouchStart={this.handleBlur}
              onChangeText={this.handleBlur}
              onSubmitEditing={this.handleFocuse}
              onChangeText={(val) => {
                this.setState({name: val});
              }}
              style={[
                styles.nameInput,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  borderBottomColor: this.state.onFocused ? 'black' : 'green',
                  borderBottomWidth: 2,
                },
              ]}
              placeholder="Name"
              placeholderTextColor="black"
            />
            <TouchableOpacity
              style={styles.stdModalBtn}
              onPress={() => this.modal(false, name)}>
              <Text style={styles.stdTxt}>Play</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <GameEngine
          ref={(ref) => {
            this.engine = ref;
          }}
          style={[
            {
              width: this.boardSize,
              height: this.boardSize,
              backgroundColor: '#ffffff',
              flex: null,
              marginTop: 100,
            },
          ]}
          systems={[GameLoop]}
          entities={{
            head: {
              position: [0, 0],
              xspeed: 1,
              yspeed: 0,
              nextMove: 10,
              updateFrequency: 10,
              size: 20,
              renderer: <Head />,
            },
            food: {
              position: [
                this.randomBetween(0, Constants.GRID_SIZE - 1),
                this.randomBetween(0, Constants.GRID_SIZE - 1),
              ],
              size: 20,
              renderer: <Food />,
            },
            tail: {size: 20, elements: [], renderer: <Tail />},
          }}
          running={this.state.running}
          onEvent={this.onEvent}>
          <StatusBar hidden={true} />
        </GameEngine>
        <View style={styles.scoreView}>
          <Text style={styles.scoreTxt}>{name}'s Score - </Text>
          <Text style={styles.scoreTxt}>{score}</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => {
                this.engine.dispatch({type: 'move-up'});
              }}>
              <View style={styles.control} />
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => {
                this.engine.dispatch({type: 'move-left'});
              }}>
              <View style={styles.control} />
            </TouchableOpacity>
            <View style={[styles.control, {backgroundColor: null}]} />
            <TouchableOpacity
              onPress={() => {
                this.engine.dispatch({type: 'move-right'});
              }}>
              <View style={styles.control} />
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => {
                this.engine.dispatch({type: 'move-down'});
              }}>
              <View style={styles.control} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    backgroundColor: '#4D4D4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    width: 300,
    height: 300,
    flexDirection: 'column',
    marginTop: 40,
  },
  controlRow: {
    height: 70,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  control: {
    width: 70,
    height: 70,
    backgroundColor: 'green',
  },
  scoreView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreTxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },
  stdModalMainView: {
    height: 320,
    width: 360,
    backgroundColor: '#455A64',
    bottom: 0,
    position: 'absolute',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 25,
    fontWeight: 'bold',
    height: 50,
    width: 250,
    marginTop: 40,
    textAlign: 'center',
  },
  modalHaderTxt: {
    textAlign: 'center',
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },
  stdModalBtn: {
    height: 50,
    width: 200,
    backgroundColor: 'blue',
    marginTop: 40,
    justifyContent: 'center',
    borderRadius: 40,
  },
  stdTxt: {
    textAlign: 'center',
    fontSize: 25,
    color: 'white',
  },
});

AppRegistry.registerComponent('game', () => Game);
