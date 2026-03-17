'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  Clock,
  Upload,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getZakatOnlineList, getZakatOnlineStats, searchZakatOnline } from '@/lib/zakat-online-api';
import { formatRupiah, formatTanggalSingkat } from '@/lib/utils';
import type { ZakatOnline, StatusZakat } from '@/types/zakat-online';

const tabs: { status: StatusZakat | 'all'; label: string; icon: React.ElementType }[] = [
  { status: 'all', label: 'Semua', icon: Eye },
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'uploaded', label: 'Uploaded', icon: Upload },
  { status: 'verified', label: 'Verified', icon: CheckCircle },
  { status: 'rejected', label: 'Rejected', icon: XCircle },
];

const statusColors: Record<StatusZakat, string> = {
  pending: 'bg-amber-100 text-amber-700',
  uploaded: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminZakatOnlinePage() {
  const [activeTab, setActiveTab] = useState<StatusZakat | 'all'>('all');
  const [transactions, setTransactions] = useState<ZakatOnline[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    uploaded: 0,
    verified: 0,
    rejected: 0,
    totalNominal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [list, statsData] = await Promise.all([
        activeTab === 'all' ? getZakatOnlineList() : getZakatOnlineList(activeTab),
        getZakatOnlineStats(),
      ]);
      setTransactions(list);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchZakatOnline(searchQuery);
      setTransactions(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getTabCount = (status: StatusZakat | 'all'): number => {
    if (status === 'all') return stats.total;
    return stats[status] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zakat Online</h1>
          <p className="text-gray-500">Kelola transaksi zakat online</p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.uploaded}</p>
                <p className="text-xs text-gray-500">Perlu Verifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-gray-500">Terverifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-bold text-[#599E6E]">
                {formatRupiah(stats.totalNominal)}
              </p>
              <p className="text-xs text-gray-500">Total Terverifikasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari nama atau kode..."
                className="flex-1 sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E]"
              />
              <Button onClick={handleSearch} disabled={isSearching} size="sm">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = getTabCount(tab.status);
              const isActive = activeTab === tab.status;

              return (
                <button
                  key={tab.status}
                  onClick={() => setActiveTab(tab.status)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#599E6E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs ${
                      isActive ? 'bg-white/20' : 'bg-gray-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#599E6E]" />
              <p className="text-gray-500 mt-2">Memuat data...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">Tidak ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Kode</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Nama</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Jenis</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Total</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Tanggal</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-mono text-xs">{tx.kode_transaksi}</td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{tx.nama_muzakki}</p>
                          {tx.jenis_zakat === 'fitrah' && (
                            <p className="text-xs text-gray-500">{tx.jumlah_jiwa} jiwa</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 capitalize">{tx.jenis_zakat}</td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatRupiah(tx.total_bayar)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[tx.status]
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">
                        {formatTanggalSingkat(tx.created_at)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Link href={`/admin/zakat-online/${tx.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
