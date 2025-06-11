import 'package:flutter/material.dart';

void main() {
  runApp(const RecyTechApp());
}

class RecyTechApp extends StatelessWidget {
  const RecyTechApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RecyTech Mobile',
      theme: ThemeData(
        primarySwatch: Colors.green,
        scaffoldBackgroundColor: Colors.grey[100],
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('RecyTech Mobile'),
      ),
      body: const Center(
        child: Text(
          'Bienvenue sur RecyTech Mobile 📱',
          style: TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
