const request = require('supertest');
const app = require('../models/server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Productos API', () => {
    let productoId;

    beforeAll(async () => {
        // Insertar un producto de prueba antes de correr los tests
        const producto = await prisma.producto.create({
            data: {
                codigo_magister: 'TEST123',
                cum_pactado: 'CUM123456',
                descripcion: 'Producto de prueba',
                regulacion: {
                    create: {
                        regulacion_tableta: 10,
                        regulacion_empaque: 20
                    }
                }
            }
        });
        productoId = producto.id_producto;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('Debe obtener productos con paginación', async () => {
        const res = await request(app).get('/pec/productos?page=1&limit=5');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('products');
    });

    test('Debe agregar un nuevo producto', async () => {
        const res = await request(app)
            .post('/pec/productos')
            .send({
                codigo_magister: 'TEST999',
                cum_pactado: 'CUM999999',
                descripcion: 'Nuevo producto',
                regulacion_tableta: 15,
                regulacion_empaque: 30
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('product');
    });

    test('Debe editar un producto existente', async () => {
        const res = await request(app)
            .put(`/pec/productos/${productoId}`)
            .send({
                descripcion: 'Producto actualizado',
                regulacion_tableta: 25
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.product.descripcion).toBe('Producto actualizado');
    });

    test('Debe eliminar un producto existente', async () => {
        const res = await request(app).delete(`/pec/productos/${productoId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Producto eliminado con éxito');
    });

    test('Debe retornar error si intenta eliminar un producto inexistente', async () => {
        const res = await request(app).delete('/pec/productos/999999');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Producto no encontrado');
    });
});
