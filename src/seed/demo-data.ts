import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Resource } from '../resources/entities/resource.entity';
import { Venue } from '../venues/entities/venue.entity';
import { GameType } from '../game-types/entities/game-type.entity';
import { Club } from '../clubs/entities/club.entity';
import { Product } from '../products/entities/product.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DemoDataService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(GameType)
    private gameTypeRepository: Repository<GameType>,
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createDemoData() {
    console.log('Creando datos de demo...');

    // Crear tipos de juego
    const gameTypes = await this.createGameTypes();
    
    // Crear clubes
    const clubs = await this.createClubs();
    
    // Crear sedes
    const venues = await this.createVenues(clubs);
    
    // Crear recursos (mesas)
    await this.createResources(venues, gameTypes);
    
    // Crear productos
    await this.createProducts(venues);
    
    // Crear usuarios demo
    await this.createUsers(clubs);

    console.log('Datos de demo creados exitosamente');
  }

  private async createGameTypes() {
    const types = [
      { name: 'Billar', description: 'Billar pool tradicional' },
      { name: 'Tres Bandas', description: 'Billar a tres bandas' },
      { name: 'Tejo', description: 'Juego de tejo tradicional' },
      { name: 'Bolirama', description: 'Máquina de bolirama' }
    ];

    const createdTypes: any[] = [];
    for (const type of types) {
      const existing = await this.gameTypeRepository.findOne({ where: { name: type.name } });
      if (!existing) {
        const newType = this.gameTypeRepository.create(type);
        createdTypes.push(await this.gameTypeRepository.save(newType));
      } else {
        createdTypes.push(existing);
      }
    }
    return createdTypes;
  }

  private async createClubs() {
    const clubsData = [
      { name: 'JcueScore Elite', description: 'Club profesional de billar' },
      { name: 'Los Héroes', description: 'Club amateur de billar' },
      { name: 'Master Club', description: 'Club de élite' },
      { name: 'Diamante', description: 'Club premium' }
    ];

    const createdClubs: any[] = [];
    for (const clubData of clubsData) {
      const existing = await this.clubRepository.findOne({ where: { name: clubData.name } });
      if (!existing) {
        const newClub = this.clubRepository.create(clubData);
        createdClubs.push(await this.clubRepository.save(newClub));
      } else {
        createdClubs.push(existing);
      }
    }
    return createdClubs;
  }

  private async createVenues(clubs: any[]) {
    const venuesData = [
      { 
        name: 'Sede Principal', 
        address: 'Calle 123 #45-67', 
        city: 'Bogotá', 
        phone: '3001234567',
        email: 'principal@jcuescore.com',
        openingTime: '10:00:00',
        closingTime: '23:00:00',
        clubId: clubs[0]?.id 
      },
      { 
        name: 'Sede Norte', 
        address: 'Carrera 45 #12-34', 
        city: 'Bogotá', 
        phone: '3007654321',
        email: 'norte@jcuescore.com',
        openingTime: '10:00:00',
        closingTime: '23:00:00',
        clubId: clubs[1]?.id 
      },
      { 
        name: 'Sede Occidente', 
        address: 'Avenida 67 #89-12', 
        city: 'Bogotá', 
        phone: '3009876543',
        email: 'occidente@jcuescore.com',
        openingTime: '10:00:00',
        closingTime: '23:00:00',
        clubId: clubs[2]?.id 
      }
    ];

    const createdVenues: any[] = [];
    for (const venueData of venuesData) {
      const existing = await this.venueRepository.findOne({ where: { name: venueData.name } });
      if (!existing) {
        const newVenue = this.venueRepository.create(venueData);
        createdVenues.push(await this.venueRepository.save(newVenue));
      } else {
        createdVenues.push(existing);
      }
    }
    return createdVenues;
  }

  private async createResources(venues: any[], gameTypes: any[]) {
    const resourcesData = [
      // Sede Principal
      { code: 'Mesa 1', gameTypeId: gameTypes[0]?.id, venueId: venues[0]?.id, pricePerHour: 15000 },
      { code: 'Mesa 2', gameTypeId: gameTypes[0]?.id, venueId: venues[0]?.id, pricePerHour: 15000 },
      { code: 'Mesa 3', gameTypeId: gameTypes[1]?.id, venueId: venues[0]?.id, pricePerHour: 20000 },
      { code: 'Mesa 4', gameTypeId: gameTypes[0]?.id, venueId: venues[0]?.id, pricePerHour: 15000 },
      
      // Sede Norte
      { code: 'Mesa 5', gameTypeId: gameTypes[0]?.id, venueId: venues[1]?.id, pricePerHour: 12000 },
      { code: 'Chancha 1', gameTypeId: gameTypes[2]?.id, venueId: venues[1]?.id, pricePerHour: 12000 },
      { code: 'Máquina 1', gameTypeId: gameTypes[3]?.id, venueId: venues[1]?.id, pricePerHour: 10000 },
      
      // Sede Occidente
      { code: 'Mesa 6', gameTypeId: gameTypes[0]?.id, venueId: venues[2]?.id, pricePerHour: 18000 },
      { code: 'Mesa 7', gameTypeId: gameTypes[1]?.id, venueId: venues[2]?.id, pricePerHour: 25000 }
    ];

    for (const resourceData of resourcesData) {
      const existing = await this.resourceRepository.findOne({ where: { code: resourceData.code } });
      if (!existing) {
        const newResource = this.resourceRepository.create(resourceData);
        await this.resourceRepository.save(newResource);
      }
    }
  }

  private async createProducts(venues: any[]) {
    const productsData = [
      // Bebidas
      { name: 'Coca-Cola 350ml', description: 'Bebida gaseosa cola', sku: 'CC350', price: 3000, cost: 1500, stock: 50, minStock: 10, unit: 'unidad', brand: 'Coca-Cola', presentation: '350ml', venueId: venues[0]?.id },
      { name: 'Coca-Cola 500ml', description: 'Bebida gaseosa cola', sku: 'CC500', price: 4000, cost: 2000, stock: 40, minStock: 8, unit: 'unidad', brand: 'Coca-Cola', presentation: '500ml', venueId: venues[0]?.id },
      { name: 'Cerveza Aguila 350ml', description: 'Cerveza lager', sku: 'AG350', price: 4000, cost: 2500, stock: 30, minStock: 6, unit: 'unidad', brand: 'Bavaria', presentation: '350ml', venueId: venues[0]?.id },
      { name: 'Cerveza Heineken 330ml', description: 'Cerveza importada', sku: 'HK330', price: 6000, cost: 3500, stock: 20, minStock: 4, unit: 'unidad', brand: 'Heineken', presentation: '330ml', venueId: venues[0]?.id },
      { name: 'Jugo Natural Naranja', description: 'Jugo fresco de naranja', sku: 'JN500', price: 5000, cost: 2000, stock: 25, minStock: 5, unit: 'unidad', brand: 'Casa', presentation: '500ml', venueId: venues[0]?.id },
      { name: 'Agua Purificada 500ml', description: 'Agua purificada', sku: 'AP500', price: 2000, cost: 800, stock: 60, minStock: 12, unit: 'unidad', brand: 'Cristal', presentation: '500ml', venueId: venues[0]?.id },
      
      // Snacks
      { name: 'Papas Margarita Limón', description: 'Papas de maíz con sabor limón', sku: 'PM45', price: 2500, cost: 1200, stock: 80, minStock: 15, unit: 'unidad', brand: 'Margarita', presentation: '45g', venueId: venues[0]?.id },
      { name: 'Papas Margarita Queso', description: 'Papas de maíz con sabor queso', sku: 'PMQ45', price: 2500, cost: 1200, stock: 75, minStock: 15, unit: 'unidad', brand: 'Margarita', presentation: '45g', venueId: venues[0]?.id },
      { name: 'Nachos con Queso', description: 'Nachos con queso derretido', sku: 'NQ150', price: 12000, cost: 6000, stock: 15, minStock: 3, unit: 'porción', brand: 'Casa', presentation: '150g', venueId: venues[0]?.id },
      
      // Comida
      { name: 'Sandwich Jamón Queso', description: 'Sandwich con jamón y queso', sku: 'SJQ', price: 8000, cost: 4000, stock: 10, minStock: 2, unit: 'unidad', brand: 'Casa', presentation: 'Completo', venueId: venues[0]?.id },
      { name: 'Hamburguesa Completa', description: 'Hamburguesa con carne, lechuga, tomate', sku: 'HB', price: 15000, cost: 8000, stock: 8, minStock: 2, unit: 'unidad', brand: 'Casa', presentation: 'Completa', venueId: venues[0]?.id },
      { name: 'Perro Caliente', description: 'Perro caliente con todos los ingredientes', sku: 'PC', price: 10000, cost: 5000, stock: 12, minStock: 2, unit: 'unidad', brand: 'Casa', presentation: 'Completo', venueId: venues[0]?.id },
      
      // Café y Postres
      { name: 'Café Americano', description: 'Café negro americano', sku: 'CA200', price: 2000, cost: 800, stock: 100, minStock: 20, unit: 'unidad', brand: 'Casa', presentation: '200ml', venueId: venues[0]?.id },
      { name: 'Café con Leche', description: 'Café con leche vaporizada', sku: 'CL250', price: 3000, cost: 1200, stock: 80, minStock: 15, unit: 'unidad', brand: 'Casa', presentation: '250ml', venueId: venues[0]?.id },
      { name: 'Brownie Chocolate', description: 'Brownie de chocolate', sku: 'BR', price: 6000, cost: 3000, stock: 20, minStock: 4, unit: 'unidad', brand: 'Casa', presentation: '80g', venueId: venues[0]?.id }
    ];

    for (const productData of productsData) {
      const existing = await this.productRepository.findOne({ where: { sku: productData.sku } });
      if (!existing) {
        const newProduct = this.productRepository.create(productData);
        await this.productRepository.save(newProduct);
      }
    }
  }

  private async createUsers(clubs: any[]) {
    const usersData = [
      // Admin
      { 
        name: 'Admin', 
        lastName: 'JcueScore', 
        email: 'admin@jcuescore.com', 
        password: 'admin123',
        docType: 'CC',
        docNumber: '123456789',
        eloRating: 2000,
        loyaltyPoints: 5000,
        clubId: clubs[0]?.id
      },
      // Garitero
      { 
        name: 'Pedro', 
        lastName: 'García', 
        email: 'garitero@jcuescore.com', 
        password: 'garitero123',
        docType: 'CC',
        docNumber: '987654321',
        eloRating: 1200,
        loyaltyPoints: 1500,
        clubId: clubs[0]?.id
      },
      // Jugadores demo
      { 
        name: 'Carlos', 
        lastName: 'Rodríguez', 
        email: 'carlos@jcuescore.com', 
        password: 'carlos123',
        docType: 'CC',
        docNumber: '456789123',
        eloRating: 1800,
        loyaltyPoints: 2500,
        clubId: clubs[1]?.id
      },
      { 
        name: 'Andrés', 
        lastName: 'Martínez', 
        email: 'andres@jcuescore.com', 
        password: 'andres123',
        docType: 'CC',
        docNumber: '789123456',
        eloRating: 1650,
        loyaltyPoints: 1800,
        clubId: clubs[1]?.id
      },
      { 
        name: 'Luis', 
        lastName: 'Pérez', 
        email: 'luis@jcuescore.com', 
        password: 'luis123',
        docType: 'CC',
        docNumber: '321654987',
        eloRating: 1900,
        loyaltyPoints: 3200,
        clubId: clubs[2]?.id
      },
      { 
        name: 'Juan', 
        lastName: 'Carlos', 
        email: 'juan@jcuescore.com', 
        password: 'juan123',
        docType: 'CC',
        docNumber: '654987321',
        eloRating: 1450,
        loyaltyPoints: 900,
        clubId: clubs[2]?.id
      },
      { 
        name: 'Miguel', 
        lastName: 'Gómez', 
        email: 'miguel@jcuescore.com', 
        password: 'miguel123',
        docType: 'CC',
        docNumber: '147258369',
        eloRating: 2100,
        loyaltyPoints: 4500,
        clubId: clubs[3]?.id
      },
      { 
        name: 'Fernando', 
        lastName: 'Paz', 
        email: 'fernando@jcuescore.com', 
        password: 'fernando123',
        docType: 'CC',
        docNumber: '369147258',
        eloRating: 1750,
        loyaltyPoints: 2100,
        clubId: clubs[3]?.id
      }
    ];

    for (const userData of usersData) {
      const existing = await this.userRepository.findOne({ where: { email: userData.email } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = this.userRepository.create({
          ...userData,
          password: hashedPassword
        });
        await this.userRepository.save(newUser);
      }
    }
  }

  async cleanDemoData() {
    console.log('Limpiando datos de demo...');
    await this.userRepository.delete({});
    await this.resourceRepository.delete({});
    await this.venueRepository.delete({});
    await this.clubRepository.delete({});
    await this.gameTypeRepository.delete({});
    console.log('Datos de demo eliminados');
  }
}
