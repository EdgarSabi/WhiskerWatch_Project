import { StyleSheet, View, Text, Pressable } from "react-native";

function GoalItem(props) {
  return (
    //bind allows you to preconfigure a function before execution
    <Pressable android_ripple={{color: '#dddddd'}} onPress={props.onDeleteItem.bind(this, props.id)}> 
      <View style={styles.goalItem}>
        <Text style={styles.goalText}>{props.text}</Text>
      </View>
    </Pressable>
  );
}

export default GoalItem;

const styles = StyleSheet.create({
  goalItem: {
    backgroundColor: "#5458CC",
    padding: 5,
    marginBottom: 6,
  },
  goalText: {
    color: "#FFFFFF",
  },
});
