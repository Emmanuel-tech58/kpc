"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Plus,
    Search,
    Package,
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    XCircle,
    BarChart3
} from 'lucide-react'
import { ProductDataTable } from '@/components/products/product-data-table'
import { ProductDialog } from '@/components/products/product-dialog'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { toast } from 'sonner'

interface Product {
    id: string
    name: string
    description?: string
    sku?: string
    barcode?: string
    brand?: string
    unit: string
    minStock: number
    maxStock?: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    category: {
        id: string
        name: string
    }
    supplier: {
        id: string
        name: string
    }
    inventory: Array<{
        id: string
        quantity: number
        reservedQty: number
        costPrice: number
        sellingPrice: number
        shop: {
            id: string
            name: string
        }
    }>
    _count: {
        saleItems: number
        purchaseItems: number
    }
}

interface Category {
    id: string
    name: string
    description?: string
}

interface Supplier {
    id: string
    name: string
    contactName?: string
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedSupplier, setSelectedSupplier] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [stockFilter, setStockFilter] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    // Dialog states
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')

    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory && { categoryId: selectedCategory }),
                ...(selectedSupplier && { supplierId: selectedSupplier }),
                ...(statusFilter && { isActive: statusFilter }),
                ...(stockFilter === 'low' && { lowStock: 'true' })
            })

            const response = await fetch(`/api/products?${params}`)
            if (!response.ok) throw new Error('Failed to fetch products')

            const data = await response.json()
            setProducts(data.products || [])
            setTotalPages(data.pagination.pages)
            setTotalProducts(data.pagination.total)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to fetch products')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories')
            if (!response.ok) throw new Error('Failed to fetch categories')
            const data = await response.json()
            setCategories(Array.isArray(data) ? data : data.categories || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            setCategories([])
        }
    }

    const fetchSuppliers = async () => {
        try {
            const response = await fetch('/api/suppliers')
            if (!response.ok) throw new Error('Failed to fetch suppliers')
            const data = await response.json()
            setSuppliers(Array.isArray(data) ? data : data.suppliers || [])
        } catch (error) {
            console.error('Error fetching suppliers:', error)
            setSuppliers([])
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
        fetchSuppliers()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchProducts(1)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [searchTerm, selectedCategory, selectedSupplier, statusFilter, stockFilter, pageSize])

    const handleCreateProduct = () => {
        setSelectedProduct(null)
        setDialogMode('create')
        setIsProductDialogOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product)
        setDialogMode('edit')
        setIsProductDialogOpen(true)
    }

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product)
        setDialogMode('view')
        setIsProductDialogOpen(true)
    }

    const handleDeleteProduct = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const handleProductSaved = () => {
        fetchProducts(currentPage)
        setIsProductDialogOpen(false)
    }

    const handleProductDeleted = () => {
        fetchProducts(currentPage)
        setIsDeleteDialogOpen(false)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
        setSelectedSupplier('')
        setStatusFilter('')
        setStockFilter('')
    }

    // Calculate stats
    const activeProducts = products.filter(p => p.isActive).length
    const lowStockProducts = products.filter(p => {
        const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
        return totalStock <= p.minStock
    }).length
    const outOfStockProducts = products.filter(p => {
        const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
        return totalStock === 0
    }).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Product Inventory
                                </h1>
                                <p className="text-gray-600">Manage your products and stock levels</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreateProduct}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Product
                    </Button>
                </div>

                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
                                <p className="text-xs text-gray-500">All products</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
                                <p className="text-2xl font-semibold text-yellow-600">{lowStockProducts}</p>
                                <p className="text-xs text-gray-500">Need restocking</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl">
                                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-semibold text-red-600">{outOfStockProducts}</p>
                                <p className="text-xs text-gray-500">Urgent attention</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts Detail Section */}
                {(lowStockProducts > 0 || outOfStockProducts > 0) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                                    <p className="text-gray-600">Products requiring immediate attention</p>
                                </div>
                            </div>
                            <Badge className="bg-red-100 text-red-800">
                                {lowStockProducts + outOfStockProducts} items
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products
                                .filter(p => {
                                    const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
                                    return totalStock <= p.minStock
                                })
                                .slice(0, 6)
                                .map((product) => {
                                    const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quan
                                    const isOutOfStock = totalStock === 0
                                    const stockPercentage = product.m

                                    return (
                                        <div key={product.id} className={`p-4 rounded-xl border ${ock
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-
                                            }`}>
                                            <div className="flex items-center justify-between mb-3">
                                  >
                                  
                              
>
                                                <Package classNam4 ${
                                   '
                                                }`} />
                                                    </div>
                                                    <Badge className={
                             
                                                            ? 'bg-red-10 
                                                            : ''
                                                    }>
                                                       k'}
                                              </Badge>
                                   iv>
                                     v>
  
                                   ">
                                                <h4 clas>
                                                {product.sku && (
                                                    <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                             )}
                                                <div className="flex ju>
                                                    <span clasn>
                                                    <span className={`font-semibol
                                                       00'
                                                  }`}>
                                   ck}
                                        </span>
div>
                                   ">

                                                    <span className="font-semibol
                                                </div>
                                   
                                                {/* Stock Level Bar */}
                                                <div className="mt-3">
                                                    <div className="fle>
                                     pan>
/span>
                                   
                                                   
                                                        <div 
                                                            className={`h-2 rounded-full ${
                             
                                                                   00' 
                                                                    : 
                                     low-500' 
0'
                                                            }`}
                                        }}
                                                     </div>
                                                    </div>
                                                </div>
                                 >
                                        </div>
                                    )
                              }
                        </div>

                       > 6 && (

                                <Bon 
                                    variant="outline" 
                                    o('low')}
                                                    classNa"
                                >
                                                    View All {low
                                </Button>
                                        </div>
                                    )
                                }
                    </div>
                )}

                        {/* Profit Analysis Section */}
                        <div className="bg-white/70 backdrop-bp-6">
                            <d-6">
                      p-3">
>
                               " />
                        </
                            <div>
                            <h3 className="text-lg fo
                                <p className=
                            </div>
                        </div>
                    </div>

                  >

                            <div cla
                                <Package clas>
                                <span className="text-sman>
                        </div>
                        <p className="text-xl f0">
                  
                  v) => {
              )
     
 ters */}rn FilMode   {/*          
    v>
       </di         
   </div>       
             </div>                  >
   n</pargiofit m-700">Prext-oranget-xs t"texsName=<p clas                  
                </p>             
         )()}%       }                        oFixed(1)
 urn margin.t        ret                        0
     ue) * 100 :Reventotal) / stue - totalCoventotalRe? ((0 > t  totalCos margin =      const                              0)
 },                                       }, 0)
                                    ))
 llingPrice.ser(invumbeity * N+ (inv.quantturn invSum    re                                        
  => {inv), ce((invSumy.redunventorp.im + n su    retur                            
        , p) => {educe((sum.r = productsenuetotalRev     const                         0)
           },                         
             }, 0)                               ice))
    nv.costPry * Number(i.quantit + (invturn invSum          re                              
    m, inv) => {((invSutory.reduce + p.invensum     return                              
      um, p) => {e((ss.reducroduct = pCostonst total  c                                
  => {   {(()                          >
    900"-orange-nt-bold text foext-xl"tlassName=       <p c             
            </div>                       
 argin</span>Avg M00">-6ngem text-orant-mediutext-sm fo=" className       <span                    />
     ge-600" rantext-oh-4 w-4 assName=" cleckCircle       <Ch                        mb-2">
 -2 gapenter ems-cex itssName="fl   <div cla                       l">
  -xndedge-50 roup-4 bg-oranssName="div cla  <                 
     /div>
        <         p>
       t</s profi>Grosle-700"urpext-p-xs tsName="text     <p clas                      </p>
                          
   )}eString(, 0).toLocal       }                            }, 0)
                               t
  um + profi invS  return                                  ty
    quantiice)) * inv.r(inv.costPrce) - NumbesellingPriNumber(inv.fit = ( const pro                                       ) => {
m, invce((invSuduventory.rem + p.in  return su                                  {
 , p) =>umce((seduucts.rrod {p     MWK                           ">
t-purple-900-bold texl fontt-x="texssName cla       <p                
      </div>                         an>
  </spal Profit">Potentile-600purpext-um tfont-medi-sm texte="amsNan clas         <sp                      />
 le-600" xt-purp-4 te"h-4 wName=Chart3 class        <Bar                      
  "> mb-2center gap-2x items-="fleclassNamediv      <                     
  >ded-xl"le-50 roun-4 bg-purplassName="p  <div c                   

     </div>                /p>
      If all sold<">0een-70xs text-gr="text-meassNa       <p cl             
               </p>                   ng()}
  eStritoLocal, 0).      }                       }, 0)
                                    )
   lingPrice)sel Number(inv.quantity *v.+ (inn invSum     retur                                   ) => {
 invSum, invreduce((nventory. sum + p.i     return                      {
          => sum, p)reduce((cts.MWK {produ                      
          ">0-90d text-greenolnt-b foe="text-xlam classN          <p                /div>
             <               /span>
  ue<even>Potential R00"reen-6um text-gnt-medi"text-sm fosName=<span clas                              />
   -600"4 text-greenw--4 "hsName=p clasTrendingU  <                        
      b-2">ter gap-2 mx items-cen"flev className=di   <                        ">
 nded-xlreen-50 rou bg-g"p-4ssName=<div cla                       

 </div>                 /p>
       ost basis<700">Ctext-blue-text-xs Name="    <p class                      p>
           </               
    )}leString().toLoca, 0        }                       }, 0)                               ostPrice).cer(invumbty * Nnti (inv.quaurn invSum +  ret                        , induce((invSum.reentorysum + p.inv     return              m, p) => {duce((sucts.re{produWK      M         ue-90ext-blld tont-bo/spue< Valal Inventorye-600">Totext-blum t-mediu font600" /t-blue- texe="h-4 w-4sNam"> mb-2er gap-2x items-cente="flessNamounded-xl">-blue-50 r-4 bgame="pv classN   <di                     s-4 gap-4"d-col md:gririd-cols-1"grid g className=  <divory</p>inventyour of al overview >Financigray-600"ext-"th3></fit Analysis Value & Prory0">Invento90t-gray-semibold texnt->divhite6 w-6 text-we="h-Up classNamrending <Trounded-xl"00 o-emerald-6500 tfrom-green-ient-to-br  bg-grad"p-2Name=ass  <div cl                          gater s-centeme="flex iassNam  <div clbetween mby-stifcenter jus-x itemflessName="iv cla0 shadow-xl rder-white/2l border boed-2x-sm roundlurs} ItemsStockProducttOfouroducts + tockPS80g-white/hover:b-gray-200 er/50 bord-whiteme="bglterFisetStock => nClick={()utt">xt-center tee="mt-4div classNam        <                    s)roductockPutOfStts + okProduc {(lowStoc   })  </div            >100)}%`, ntageckPerce.min(stoMath{ width: `${    style={                 'bg-green-50   :                                                                      -yel      ? 'bg                             0 ge < 5Percentastock? 'bg-red-5 k utOfStocsO       i                             h-2">nded-full-200 roug-grayfull bssName="w-la <div civ>       </d          }%<ed(0)ntage.toFixercestockPspan>{    <                                                    k Level</sspan>Stoc        <           -1"-gray-600 mbtext-xs texteen ify-betwx just             ck}</span>toct.minS>{produray-900"ext-gd t</span>n Required:600">Miy-e="text-grasNam clas<spansmt-ween texify-betstju="flex  classNameiv       <d         </                                                          {totalSto                      ow-6 'text-yelled-600' :ck ? 'text-rOfSto isOut ${dpaurrent:</sray-600">Ct-g="texmesNa text-sm"tify-betweens                   .name}</h4uct">{produncate tr900y-graedium text-me="font-msNa"space-y-2Name= <div class                                                  di   </     </d                  Low Stock' : 't of Stocock ? 'OuStsOutOf {iyellow-80000 text-ow-1bg-yell800'-red-0 textock fSt isOutO                          t-yellow-600' : 'texed-600'text-rutOfStock ?   isO                       h-4 w-e={`   }`}                                                 llow-100'ye-100' : 'bg-redg- ? 'butOfStockisO                          nded-lg ${e={`p-1 rouv classNam <di                 er gap-2"ntce"flex items-assName=  <div cl            llow-200'order-ye0 byellow-5utOfSt   isO   : 000 ck) * 1uct.minStoock / prod(totalStStock > 0 ? in)tity, 0
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search products by name, SKU, barcode, or brand..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-48"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-48"
                            >
                                <option value="">All Suppliers</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-32"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>

                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-32"
                            >
                                <option value="">All Stock</option>
                                <option value="low">Low Stock</option>
                            </select>

                            {(searchTerm || selectedCategory || selectedSupplier || statusFilter || stockFilter) && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="h-12 px-6 bg-white/50 border-gray-200 hover:bg-white/80 rounded-xl"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                                <ProductDataTable
                                    products={products}
                                    loading={loading}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalProducts={totalProducts}
                                    pageSize={pageSize}
                                    onPageChange={fetchProducts}
                                    onPageSizeChange={handlePageSizeChange}
                                    onEdit={handleEditProduct}
                                    onView={handleViewProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            </div>

                            {/* Dialogs */}
                            <ProductDialog
                                open={isProductDialogOpen}
                                onOpenChange={setIsProductDialogOpen}
                                product={selectedProduct}
                                mode={dialogMode}
                                categories={categories}
                                suppliers={suppliers}
                                onSave={handleProductSaved}
                            />

                            <DeleteProductDialog
                                open={isDeleteDialogOpen}
                                onOpenChange={setIsDeleteDialogOpen}
                                product={selectedProduct}
                                onDelete={handleProductDeleted}
                            />
                    </div>
        </div>
            )
}