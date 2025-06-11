import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/config.dart';

class AuthApi {
  static Future<http.Response> login(String email, String password) async {
    final url = Uri.parse('${Config.baseUrl}/auth/login');

    return await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
  }

  static Future<http.Response> register(String email, String password, String name) async {
    final url = Uri.parse('${Config.baseUrl}/auth/register');

    return await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password, 'name': name}),
    );
  }
}
