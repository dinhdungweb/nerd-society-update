import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nerdsociety.com.vn' },
        update: {},
        create: {
            email: 'admin@nerdsociety.com.vn',
            name: 'Admin Nerd Society',
            password: adminPassword,
            phone: '0368483689',
            role: 'ADMIN',
        },
    })
    console.log('✅ Admin user created:', admin.email)

    // Create locations
    await prisma.location.upsert({
        where: { id: 'loc-ho-tung-mau' },
        update: {},
        create: {
            id: 'loc-ho-tung-mau',
            name: 'Cơ sở Hồ Tùng Mậu',
            address: 'Tập thể trường múa, Khu Văn hóa & Nghệ Thuật, đường Hồ Tùng Mậu, P. Mai Dịch, Hà Nội',
            phone: '0368483689',
            mapUrl: 'https://maps.app.goo.gl/1hdXj2VDtcScxGKm9',
            isActive: true,
        },
    })

    await prisma.location.upsert({
        where: { id: 'loc-tay-son' },
        update: {},
        create: {
            id: 'loc-tay-son',
            name: 'Cơ sở Tây Sơn',
            address: 'Tầng 2, 3 ngõ 167 Tây Sơn, Hà Nội',
            phone: '0368483689',
            mapUrl: 'https://maps.app.goo.gl/RVeYRTPuWTuiTymq9',
            isActive: true,
        },
    })
    console.log('✅ Locations created: 2')

    // Create combos
    const combos = [
        { slug: 'combo-1h', name: 'Combo 1 Giờ', duration: 60, price: 25000, description: 'Trải nghiệm không gian trong 1 giờ', features: ['1 giờ sử dụng', '1 đồ uống miễn phí', 'WiFi tốc độ cao'], icon: 'clock', isPopular: false, sortOrder: 1 },
        { slug: 'combo-3h', name: 'Combo 3 Giờ', duration: 180, price: 55000, description: 'Combo dành cho buổi học nhóm ngắn', features: ['3 giờ sử dụng', '2 đồ uống miễn phí', 'WiFi tốc độ cao', 'Ổ cắm điện'], icon: 'coffee', isPopular: true, sortOrder: 2 },
        { slug: 'combo-6h', name: 'Combo 6 Giờ', duration: 360, price: 85000, description: 'Nửa ngày học tập hiệu quả', features: ['6 giờ sử dụng', 'Đồ uống không giới hạn', 'WiFi tốc độ cao', 'Ổ cắm điện', 'Máy lạnh'], icon: 'book', isPopular: true, sortOrder: 3 },
        { slug: 'combo-24h', name: 'Combo 24 Giờ', duration: 1440, price: 180000, description: 'Trọn ngày đêm', features: ['24 giờ sử dụng', 'Đồ uống không giới hạn', 'WiFi tốc độ cao', 'Ổ cắm điện', 'Máy lạnh'], icon: 'fire', isPopular: true, sortOrder: 4 },
    ]

    for (const combo of combos) {
        await prisma.combo.upsert({
            where: { slug: combo.slug },
            update: {},
            create: combo,
        })
    }
    console.log('✅ Combos created:', combos.length)

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
