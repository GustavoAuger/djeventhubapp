export interface User {
    image: string; // Cambiado a string para almacenar la URL de la imagen
    uid: string;
    email: string;
    displayName: string;
    password: string;
    name: string;
    role: string;  // Nuevo campo de rol
}