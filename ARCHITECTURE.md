# BodyCheck production architecture
Mobile App -> HTTPS API -> Auth/Consent -> Symptom & Red-Flag Engine -> Health Records -> Hospital Recommendation -> HIRA APIs -> PostgreSQL
Recommended deployment: Expo/React Native, managed Node backend, managed PostgreSQL, cloud secret manager, error/APM monitoring.
