const request = require('supertest');
const express = require('express');
const { ShowLaboratories, AddLaboratory, EditLaboratory, DeleteLaboratory } = require('../controllers/laboratoryController');
const { PrismaClient } = require('@prisma/client');

// Inicializa una aplicación de Express para las pruebas
const app = express();
app.use(express.json()); // Para parsear JSON en las peticiones

// Mock de PrismaClient
const prisma = new PrismaClient();
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        laboratorio: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        productoLaboratorio: {
            findMany: jest.fn(),
        },
        $disconnect: jest.fn(),
    }))
}));

// Rutas de prueba
app.get('/laboratories', ShowLaboratories);
app.post('/laboratories', AddLaboratory);
app.put('/laboratories/:id', EditLaboratory);
app.delete('/laboratories/:id', DeleteLaboratory);

describe('Laboratory Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpiar mocks después de cada prueba
    });

    it('should show laboratories', async () => {
        // Configura el mock para que `findMany` devuelva una lista de laboratorios
        const mockLaboratories = [{ id_laboratorio: 1, nombre: 'Lab1' }];
        prisma.laboratorio.findMany.mockResolvedValue(mockLaboratories);

        const response = await request(app).get('/laboratories');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockLaboratories);
    });

    it('should add a new laboratory', async () => {
        const newLaboratory = { nombre: 'Lab2' };
        const mockNewLaboratory = { id_laboratorio: 2, ...newLaboratory };

        prisma.laboratorio.create.mockResolvedValue(mockNewLaboratory);

        const response = await request(app)
            .post('/laboratories')
            .send(newLaboratory);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Laboratorio agregado con éxito');
        expect(response.body.laboratory).toEqual(mockNewLaboratory);
    });

    it('should edit an existing laboratory', async () => {
        const updatedData = { nombre: 'Updated Lab' };
        const mockUpdatedLaboratory = { id_laboratorio: 1, ...updatedData };

        prisma.laboratorio.update.mockResolvedValue(mockUpdatedLaboratory);

        const response = await request(app)
            .put('/laboratories/1')
            .send(updatedData);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Laboratorio actualizado con éxito');
        expect(response.body.laboratory).toEqual(mockUpdatedLaboratory);
    });

    it('should delete a laboratory', async () => {
        // Simular que no hay productos asociados al laboratorio
        prisma.productoLaboratorio.findMany.mockResolvedValue([]);
        prisma.laboratorio.delete.mockResolvedValue({});

        const response = await request(app).delete('/laboratories/1');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Laboratorio eliminado con éxito');
    });

    it('should return error when deleting a laboratory with products', async () => {
        // Simular que el laboratorio tiene productos asociados
        prisma.productoLaboratorio.findMany.mockResolvedValue([{ id: 1 }]);

        const response = await request(app).delete('/laboratories/1');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No se puede eliminar el laboratorio porque tiene productos asociados');
    });
});
