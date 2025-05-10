// TodoScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');

  const getToken = async () => await auth().currentUser?.getIdToken();

  const fetchTasks = async () => {
    const token = await getToken();
    const res = await axios.get('http://localhost:3000/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  const addTask = async () => {
    const token = await getToken();
    await axios.post(
      'http://localhost:3000/tasks',
      { title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTitle('');
    fetchTasks();
  };

  const toggleComplete = async (task: Task) => {
    const token = await getToken();
    await axios.put(
      `http://localhost:3000/tasks/${task._id}`,
      { completed: !task.completed },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const token = await getToken();
    await axios.delete(`http://localhost:3000/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <View>
      <TextInput placeholder="New Task" value={title} onChangeText={setTitle} />
      <Button title="Add Task" onPress={addTask} />
      <FlatList
        data={tasks}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text onPress={() => toggleComplete(item)} style={{ textDecorationLine: item.completed ? 'line-through' : 'none' }}>{item.title}</Text>
            <Button title="X" onPress={() => deleteTask(item._id)} />
          </View>
        )}
      />
    </View>
  );
}

