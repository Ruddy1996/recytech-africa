import 'dart:convert';
import 'package:flutter/material.dart';
import '../data/api/auth_api.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  Future<bool> login(String email, String password) async {
    final res = await AuthApi.login(email, password);
    final data = jsonDecode(res.body);

    if (res.statusCode == 200) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      return true;
    }

    debugPrint('Erreur login: ${data['message']}');
    return false;
  }

  Future<bool> register(String email, String password, String name) async {
    final res = await AuthApi.register(email, password, name);
    final data = jsonDecode(res.body);

    if (res.statusCode == 201) return true;

    debugPrint('Erreur register: ${data['message']}');
    return false;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }
}
