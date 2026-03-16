'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Banknote,
  Scale,
  HandHeart,
  TrendingUp,
  UserPlus,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { formatRupiah, formatKg, formatWaktuJakarta } from '@/lib/utils';
import { getStatistikDashboard, getPenerimaan } from '@/lib/api';
import { getCurrentHijriYear, type StatistikDashboard, type Penerimaan } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatistikDashboard | null>(null);
  const [recentActivity, setRecentActivity] = useState<Penerimaan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, penerimaanData] = await Promise.all([
        getStatistikDashboard(),
        getPenerimaan(getCurrentHijriYear()),
      ]);
      setStats(statsData);
      // Get 5 most recent
      setRecentActivity(penerimaanData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#599E6E] mx-auto mb-4" />
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Gagal memuat data</p>
      </div>
    );
  }

  const totalUang = stats.penerimaan.zakatUang + stats.penerimaan.zakatMaal + stats.penerimaan.infaq;
  const serapanPersen = stats.penerimaan.zakatUang > 0
    ? Math.round((stats.penyaluran.uang / stats.penerimaan.zakatUang) * 100)
    : 0;
  const rataRataJiwa = stats.penerimaan.totalMuzakki > 0
    ? (stats.penerimaan.totalJiwa / stats.penerimaan.totalMuzakki).toFixed(1)
    : '0';

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="mt-1 text-gray-500">
            Kelola penerimaan dan penyaluran zakat Musholla Al-Hikmah
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada aktivitas</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{activity.nama_muzakki}</p>
                      <p className="text-sm text-gray-500">
                        {activity.jenis_fitrah === 'uang' ? 'Zakat Fitrah (Uang)' :
                         activity.jenis_fitrah === 'beras' ? 'Zakat Fitrah (Beras)' : 'Zakat'}
                        {activity.nominal_maal ? ' + Maal' : ''}
                        {activity.nominal_infaq ? ' + Infaq' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#599E6E]">
                        {activity.jenis_fitrah === 'beras'
                          ? formatKg(activity.nominal_fitrah || 0)
                          : formatRupiah(activity.nominal_fitrah || 0)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatWaktuJakarta(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  {formatRupiah(totalUang)}
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
                  {serapanPersen}%
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
                  {rataRataJiwa} jiwa
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Update */}
      {stats.lastUpdate && (
        <div className="mt-6 text-center text-sm text-gray-400">
          <Clock className="w-4 h-4 inline-block mr-1" />
          Terakhir diperbarui: {formatWaktuJakarta(stats.lastUpdate)}
        </div>
      )}
    </div>
  );
}
