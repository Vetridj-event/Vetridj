import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
    try {
        const conn = await dbConnect()
        const db = conn.connection.db
        const requests = await db.collection('product_requests').find({}).sort({ date: -1 }).toArray()
        return NextResponse.json(requests.map(r => ({ ...r, id: r._id.toString() })))
    } catch (error) {
        console.error('Fetch requests error:', error)
        return NextResponse.json({ error: 'Failed to fetch product requests' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const conn = await dbConnect()
        const db = conn.connection.db
        const { id, ...rest } = data
        const result = await db.collection('product_requests').insertOne({
            ...rest,
            date: rest.date || new Date().toISOString(),
            status: 'PENDING'
        })
        return NextResponse.json({ success: true, id: result.insertedId })
    } catch (error) {
        console.error('Create request error:', error)
        return NextResponse.json({ error: 'Failed to create product request' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const data = await req.json()
        const conn = await dbConnect()
        const db = conn.connection.db
        const { id: _id, ...updateData } = data

        await db.collection('product_requests').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Update request error:', error)
        return NextResponse.json({ error: 'Failed to update product request' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const conn = await dbConnect()
        const db = conn.connection.db
        await db.collection('product_requests').deleteOne({ _id: new ObjectId(id) })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete request error:', error)
        return NextResponse.json({ error: 'Failed to delete product request' }, { status: 500 })
    }
}
