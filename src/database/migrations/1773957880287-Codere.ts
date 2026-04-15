import { MigrationInterface, QueryRunner } from "typeorm";

export class Codere1773957880287 implements MigrationInterface {
    name = 'Codere1773957880287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "venue" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "address" character varying(500) NOT NULL, "city" character varying(100), "phone" character varying(50) NOT NULL, "email" character varying(255), "openingTime" TIME NOT NULL, "closingTime" TIME NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c53deb6d1bcb088f9d459e7dbc0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_type" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(500), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_41324507859cf3f8aa88fe2cda9" UNIQUE ("name"), CONSTRAINT "PK_89f59c63f16e43dfff8412268bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."resource_status_enum" AS ENUM('available', 'occupied', 'maintenance', 'reserved')`);
        await queryRunner.query(`CREATE TABLE "resource" ("id" SERIAL NOT NULL, "venueId" integer NOT NULL, "gameTypeId" integer NOT NULL, "code" character varying(100) NOT NULL, "status" "public"."resource_status_enum" NOT NULL DEFAULT 'available', "pricePerHour" numeric(10,2) NOT NULL, "specifications" json, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "phone" character varying(50) NOT NULL, "email" character varying(255), "loyaltyPoints" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservation_status_enum" AS ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."reservation_paymentstatus_enum" AS ENUM('pending', 'partial', 'paid')`);
        await queryRunner.query(`CREATE TABLE "reservation" ("id" SERIAL NOT NULL, "customerId" integer NOT NULL, "resourceId" integer NOT NULL, "venueId" integer NOT NULL, "reservationDate" date NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "status" "public"."reservation_status_enum" NOT NULL DEFAULT 'pending', "totalAmount" numeric(10,2) NOT NULL, "paidAmount" numeric(10,2) NOT NULL DEFAULT '0', "paymentStatus" "public"."reservation_paymentstatus_enum" NOT NULL DEFAULT 'pending', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_category" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(500), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_96152d453aaea425b5afde3ae9f" UNIQUE ("name"), CONSTRAINT "PK_0dce9bc93c2d2c399982d04bef1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_subcategory" ("id" SERIAL NOT NULL, "categoryId" integer NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(500), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_0c9ba3f2d09244e06fc22ff618d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_type" ("id" SERIAL NOT NULL, "subcategoryId" integer NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(500), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e0843930fbb8854fe36ca39dae1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "venueId" integer NOT NULL, "productTypeId" integer NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(500), "sku" character varying(100) NOT NULL, "barcode" character varying(100), "brand" character varying(100), "presentation" character varying(100), "price" numeric(10,2) NOT NULL, "cost" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "minStock" integer NOT NULL DEFAULT '0', "unit" character varying(50) NOT NULL DEFAULT 'unidad', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('draft', 'issued', 'paid', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" SERIAL NOT NULL, "invoiceNumber" character varying(100) NOT NULL, "customerId" integer, "venueId" integer NOT NULL, "issueDate" date NOT NULL, "total" numeric(10,2) NOT NULL, "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'draft', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d7bed97fb47876e03fd7d7c285a" UNIQUE ("invoiceNumber"), CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_paymentmethod_enum" AS ENUM('cash', 'card', 'transfer', 'qr')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "invoiceId" integer NOT NULL, "amount" numeric(10,2) NOT NULL, "paymentMethod" "public"."payment_paymentmethod_enum" NOT NULL DEFAULT 'cash', "paymentDate" date NOT NULL, "status" "public"."payment_status_enum" NOT NULL DEFAULT 'completed', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_item" ("id" SERIAL NOT NULL, "invoiceId" integer NOT NULL, "reservationId" integer, "productId" integer, "description" character varying(500) NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "total" numeric(10,2) NOT NULL, CONSTRAINT "PK_621317346abdf61295516f3cb76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."equipment_status_enum" AS ENUM('available', 'in-use', 'damaged', 'maintenance')`);
        await queryRunner.query(`CREATE TABLE "equipment" ("id" SERIAL NOT NULL, "venueId" integer NOT NULL, "gameTypeId" integer NOT NULL, "resourceId" integer, "name" character varying(255) NOT NULL, "code" character varying(100), "stock" integer NOT NULL DEFAULT '0', "minStock" integer NOT NULL DEFAULT '0', "status" "public"."equipment_status_enum" NOT NULL DEFAULT 'available', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0722e1b9d6eb19f5874c1678740" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "resource" ADD CONSTRAINT "FK_940bfa03a573b5e4fe8e2af3929" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource" ADD CONSTRAINT "FK_3727d1bfefe30d10cbe7c41c823" FOREIGN KEY ("gameTypeId") REFERENCES "game_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_7dce8a5a6907476eba30fedde91" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_701ab4e234e7fa7c122adbb68ca" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_3069aa29782412a8d0139a432a7" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_subcategory" ADD CONSTRAINT "FK_6b90973c58447353b53d66060bb" FOREIGN KEY ("categoryId") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_type" ADD CONSTRAINT "FK_e0238ed4fbb2e61fb522a95382e" FOREIGN KEY ("subcategoryId") REFERENCES "product_subcategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_4fcc4129164969e21545255923a" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_374bfd0d1b0e1398d7206456d98" FOREIGN KEY ("productTypeId") REFERENCES "product_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_925aa26ea12c28a6adb614445ee" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_65ea4a7d0ac1bae7b4bb49828c9" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_87223c7f1d4c2ca51cf69927844" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_553d5aac210d22fdca5c8d48ead" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_06f1bbaf192c135ea16f62918c7" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_e558df60d7d9a3e412ef0bbb844" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD CONSTRAINT "FK_0eb3452f6cbeec1b48096ebc856" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD CONSTRAINT "FK_cde091f038a54cc2fa88e5db173" FOREIGN KEY ("gameTypeId") REFERENCES "game_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD CONSTRAINT "FK_7abf306d76388cc439c67347ee2" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipment" DROP CONSTRAINT "FK_7abf306d76388cc439c67347ee2"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP CONSTRAINT "FK_cde091f038a54cc2fa88e5db173"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP CONSTRAINT "FK_0eb3452f6cbeec1b48096ebc856"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_e558df60d7d9a3e412ef0bbb844"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_06f1bbaf192c135ea16f62918c7"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_553d5aac210d22fdca5c8d48ead"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_87223c7f1d4c2ca51cf69927844"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_65ea4a7d0ac1bae7b4bb49828c9"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_925aa26ea12c28a6adb614445ee"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_374bfd0d1b0e1398d7206456d98"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_4fcc4129164969e21545255923a"`);
        await queryRunner.query(`ALTER TABLE "product_type" DROP CONSTRAINT "FK_e0238ed4fbb2e61fb522a95382e"`);
        await queryRunner.query(`ALTER TABLE "product_subcategory" DROP CONSTRAINT "FK_6b90973c58447353b53d66060bb"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_3069aa29782412a8d0139a432a7"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_701ab4e234e7fa7c122adbb68ca"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_7dce8a5a6907476eba30fedde91"`);
        await queryRunner.query(`ALTER TABLE "resource" DROP CONSTRAINT "FK_3727d1bfefe30d10cbe7c41c823"`);
        await queryRunner.query(`ALTER TABLE "resource" DROP CONSTRAINT "FK_940bfa03a573b5e4fe8e2af3929"`);
        await queryRunner.query(`DROP TABLE "equipment"`);
        await queryRunner.query(`DROP TYPE "public"."equipment_status_enum"`);
        await queryRunner.query(`DROP TABLE "invoice_item"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_paymentmethod_enum"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "product_type"`);
        await queryRunner.query(`DROP TABLE "product_subcategory"`);
        await queryRunner.query(`DROP TABLE "product_category"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_status_enum"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "resource"`);
        await queryRunner.query(`DROP TYPE "public"."resource_status_enum"`);
        await queryRunner.query(`DROP TABLE "game_type"`);
        await queryRunner.query(`DROP TABLE "venue"`);
    }

}
