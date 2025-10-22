"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    DollarSign,
    Calendar,
    Filter,
    Download,
    Edit,
    Trash2,
    Receipt
} from "lucide-react"
import { toast } from 'sonner'

interface OperatingExpense {
    id: string
    description: string
    amount: number
    category: string
    date: string
    notes?: string
    isRecurring: boolean
    recurringPeriod?: string
    createdAt: string
}

export default function ExpensesPage() {
    const [loading, setLoading] = useState(true)
    const [expenses, setExpenses] = useState<OperatingExpense[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [dateRange, setDateRange] = useState({ start: '', end: '' })

    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        isRecurring: false,
        recurringPeriod: ''
    })

    const expenseCategories = [
        'Rent & Utilities',
        'Marketing & Advertising',
        'Office Supplies',
        'Transportation',
        'Professional Services',
        'Insurance',
        'Equipment & Maintenance',
        'Staff Salaries',
        'Other'
    ]

    useEffect(() => {
        fetchExpenses()
    }, [selectedCategory, dateRange])

    const fetchExpenses = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (selectedCategory) params.append('category', selectedCategory)
            if (dateRange.start) params.append('startDate', dateRange.start)
            if (dateRange.end) params.append('endDate', dateRange.end)

            const response = await fetch(`/api/expenses?${params}`)
            if (response.ok) {
                const data = await response.json()
                setExpenses(data.expenses || [])
            } else {
                throw new Error('Failed to fetch expenses')
            }
        } catch (error) {
            console.error('Error fetching expenses:', error)
            toast.error('Failed to load expenses')
        } finally {
            setLoading(false)
        }
    }

    const handleAddExpense = async () => {
        try {
            if (!newExpense.description || !newExpense.amount || !newExpense.category) {
                toast.error('Please fill in all required fields')
                return
            }

            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newExpense)
            })

            if (response.ok) {
                toast.success('Expense added successfully')
                setShowAddForm(false)
                setNewExpense({
                    description: '',
                    amount: 0,
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                    isRecurring: false,
                    recurringPeriod: ''
                })
                fetchExpenses()
            } else {
                throw new Error('Failed to add expense')
            }
        } catch (error) {
            console.error('Error adding expense:', error)
            toast.error('Failed to add expense')
        }
    }

    const formatCurrency = (amount: number) => `MWK ${amount.toLocaleString()}`

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="ml-3 text-gray-600">Loading expenses...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Operating Expenses</h1>
                        <p className="text-muted-foreground">
                            Track and manage your business operating expenses
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-gray-600">Total Expenses</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(totalExpenses)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Receipt className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-600">Total Records</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {expenses.length}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-600">This Month</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(
                                    expenses
                                        .filter(expense => {
                                            const expenseDate = new Date(expense.date)
                                            const now = new Date()
                                            return expenseDate.getMonth() === now.getMonth() &&
                                                expenseDate.getFullYear() === now.getFullYear()
                                        })
                                        .reduce((sum, expense) => sum + expense.amount, 0)
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4 flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Category:</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                                >
                                    <option value="">All Categories</option>
                                    {expenseCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">From:</label>
                                <Input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-auto"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">To:</label>
                                <Input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-auto"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Expense Form */}
                {showAddForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Expense</CardTitle>
                            <CardDescription>Record a new operating expense</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <Input
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Office rent, utilities, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (MWK) *
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select Category</option>
                                        {expenseCategories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date *
                                    </label>
                                    <Input
                                        type="date"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <Input
                                    value={newExpense.notes}
                                    onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional notes (optional)"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddExpense}>
                                        Add Expense
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Expenses List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Records</CardTitle>
                        <CardDescription>
                            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="font-medium text-gray-900">{expense.description}</h4>
                                                <Badge variant="secondary">{expense.category}</Badge>
                                                {expense.isRecurring && (
                                                    <Badge variant="outline">Recurring</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                <span>{new Date(expense.date).toLocaleDateString()}</span>
                                                {expense.notes && <span>• {expense.notes}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="font-bold text-lg text-red-600">
                                                {formatCurrency(expense.amount)}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No expenses found</p>
                                    <p className="text-sm">Add your first operating expense to get started</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}