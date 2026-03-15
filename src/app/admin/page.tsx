import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Banknote,
  Scale,
  HandHeart,
  TrendingUp,
  UserPlus,
  Clock
} from 'lucide-react';
import { formatRupiah, formatKg } from '@/lib/utils';
import Link from 'next/link';

// Data dummy untuk admin dashboard
const stats = {
  penerimaan: {
    totalMuzakki: 75,
    totalJiwa: 250,
    zakatUang: 12500000,
    zakatBeras: 312.5,
    zakatMaal: 5000000,
    infaq: 1500000,
  },
  penyaluran: {
    totalMustahik: 69,
    uang: 10000000,
    beras: 250,
  },
  recentActivity: [
    { nama: 'Pak Prio', jenis: 'Zakat Fitrah', nominal: 250000, waktu: '2 jam lalu' },
    { nama: 'Pak R. Shopam', jenis: 'Zakat Fitrah', nominal: 200000, waktu: '3 jam lalu' },
    { nama: 'Pak Iwan', jenis: 'Zakat Fitrah', nominal: 150000, waktu: '5 jam lalu' },
  ],
};

export default function AdminDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-1 text-gray-500">
          Kelola penerimaan dan penyaluran zakat Musholla Al-Hikmah
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#599E6E]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#599E6E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.penerimaan.totalMuzakki}</p>
              <p className="text-xs text-gray-500">Muzakki</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HandHeart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.penyaluran.totalMustahik}</p>
              <p className="text-xs text-gray-500">Mustahik</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#599E6E]/10 rounded-lg">
              <Banknote className="w-5 h-5 text-[#599E6E]" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.penerimaan.zakatUang)}</p>
              <p className="text-xs text-gray-500">Zakat Uang</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatKg(stats.penerimaan.zakatBeras)}</p>
              <p className="text-xs text-gray-500">Zakat Beras</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/penerimaan"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-[#599E6E]/5 hover:border-[#599E6E]/20 transition-colors"
            >
              <div className="p-3 bg-[#599E6E]/10 rounded-lg">
                <UserPlus className="w-6 h-6 text-[#599E6E]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Input Penerimaan Zakat</h3>
                <p className="text-sm text-gray-500">Tambah data muzakki baru</p>
              </div>
            </Link>
            <Link
              href="/admin/penyaluran"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <HandHeart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Input Penyaluran Zakat</h3>
                <p className="text-sm text-gray-500">Catat distribusi ke mustahik</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{activity.nama}</p>
                    <p className="text-sm text-gray-500">{activity.jenis}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#599E6E]">
                      {formatRupiah(activity.nominal)}
                    </p>
                    <p className="text-xs text-gray-400">{activity.waktu}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#599E6E]" />
              Total Penerimaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Zakat Fitrah (Uang)</span>
                <span className="font-medium">{formatRupiah(stats.penerimaan.zakatUang)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Zakat Fitrah (Beras)</span>
                <span className="font-medium">{formatKg(stats.penerimaan.zakatBeras)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Zakat Maal</span>
                <span className="font-medium">{formatRupiah(stats.penerimaan.zakatMaal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Infaq</span>
                <span className="font-medium">{formatRupiah(stats.penerimaan.infaq)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Uang</span>
                <span className="text-[#599E6E]">
                  {formatRupiah(stats.penerimaan.zakatUang + stats.penerimaan.zakatMaal + stats.penerimaan.infaq)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-blue-600" />
              Total Penyaluran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Uang Tersalurkan</span>
                <span className="font-medium">{formatRupiah(stats.penyaluran.uang)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Beras Tersalurkan</span>
                <span className="font-medium">{formatKg(stats.penyaluran.beras)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Mustahik</span>
                <span className="font-medium">{stats.penyaluran.totalMustahik} orang</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-500">Serapan</span>
                <span className="font-semibold text-[#599E6E]">
                  {Math.round((stats.penyaluran.uang / stats.penerimaan.zakatUang) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Statistik Muzakki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Muzakki</span>
                <span className="font-medium">{stats.penerimaan.totalMuzakki} orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Jiwa</span>
                <span className="font-medium">{stats.penerimaan.totalJiwa} jiwa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rata-rata/Muzakki</span>
                <span className="font-medium">
                  {(stats.penerimaan.totalJiwa / stats.penerimaan.totalMuzakki).toFixed(1)} jiwa
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
