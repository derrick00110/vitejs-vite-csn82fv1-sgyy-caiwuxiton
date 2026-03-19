// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, DollarSign, Download, Upload, Plus, Trash2, CheckCircle, GraduationCap, AlertCircle, Wallet, Cloud, Loader2 } from 'lucide-react';

// 1. 你的专属云数据库配置
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

const myFirebaseConfig = {
  apiKey: "AIzaSyD525Z346nu8-g9t8b3yyn8udsk0619Lwg",
  authDomain: "sgyy-caiwu-xiton.firebaseapp.com",
  projectId: "sgyy-caiwu-xiton",
  storageBucket: "sgyy-caiwu-xiton.firebasestorage.app",
  messagingSenderId: "516196490269",
  appId: "1:516196490269:web:adec80957112528fc6faf4",
  measurementId: "G-5MWZ6YYGTH"
};

// 初始化数据库
const app = initializeApp(myFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'shangu-music-app';

// 原有的基础默认数据，仅在数据库为空时提供“一键导入”使用
const defaultData = [
  { id: '1', month: '10月', student: '贺同学', course: '未写明', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '已付全款' },
  { id: '2', month: '10月', student: '杨同学', course: '未写明', revenue: 1000, teacher: '郭', commissionPaid: 400, isFinished: true, notes: '已付1000元' },
  { id: '3', month: '10月', student: '郭同学', course: '架子鼓', revenue: 2480, teacher: '刘', commissionPaid: 494, isFinished: false, notes: '已付全款(记录已结494)' },
  { id: '4', month: '10月', student: '李同学', course: '钢琴', revenue: 2200, teacher: '郭', commissionPaid: 880, isFinished: true, notes: '已付全款' },
  { id: '5', month: '10月', student: '唐同学', course: '吉他', revenue: 2480, teacher: '郭', commissionPaid: 992, isFinished: true, notes: '郭结496+496' },
  { id: '6', month: '11月', student: '杜同学', course: '吉他', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '已付全款' },
  { id: '7', month: '11月', student: '婷同学', course: '声乐', revenue: 4680, teacher: '郭', commissionPaid: 936, isFinished: false, notes: '20+2送节' },
  { id: '8', month: '11月', student: '双王同学', course: '声乐', revenue: 3350, teacher: '郭', commissionPaid: 1340, isFinished: false, notes: '40%全结清(提前预结)' },
  { id: '9', month: '11月', student: '晓东同学', course: '声乐', revenue: 300, teacher: '郭', commissionPaid: 120, isFinished: true, notes: '300定金已结课' },
  { id: '10', month: '11月', student: '成同学', course: '钢琴初级', revenue: 2480, teacher: '郭', commissionPaid: 992, isFinished: true, notes: '已付2480' },
  { id: '11', month: '11月', student: '罗同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
  { id: '12', month: '11月', student: '袁国翔', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 1032, isFinished: true, notes: '已结清' },
  { id: '13', month: '11月', student: '冬棠', course: '架子鼓初级', revenue: 2480, teacher: '钱', commissionPaid: 496, isFinished: false, notes: '仅白天' },
  { id: '14', month: '11月', student: '杜同学', course: '钢琴初转高', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '待补1800' },
  { id: '15', month: '11月', student: '伍同学', course: '吉他高级', revenue: 4280, teacher: '郭', commissionPaid: 856, isFinished: false, notes: '已付4280' },
  { id: '16', month: '11月', student: '谢同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
  { id: '17', month: '11月', student: '江同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
  { id: '18', month: '11月', student: '郑同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
  { id: '19', month: '12月', student: '叶同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
  { id: '20', month: '12月', student: '刘同学', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 992, isFinished: true, notes: '已结课' },
  { id: '21', month: '12月', student: '佩佩同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
  { id: '22', month: '12月', student: '佩佩同学', course: '架子鼓初级', revenue: 2480, teacher: '钱', commissionPaid: 496, isFinished: false, notes: '全款' },
  { id: '23', month: '12月', student: '潘同学', course: '架子鼓高级', revenue: 4280, teacher: '钱', commissionPaid: 856, isFinished: false, notes: '全款' },
  { id: '24', month: '12月', student: '苏同学', course: '架子鼓初级', revenue: 2480, teacher: '钱', commissionPaid: 496, isFinished: false, notes: '全款' },
  { id: '25', month: '12月', student: '余同学', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 0, isFinished: false, notes: '黄老师未结' },
  { id: '26', month: '12月', student: '莫同学', course: '即兴伴奏初级', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '全款' },
  { id: '27', month: '12月', student: '冬青同学', course: '声乐(一二)', revenue: 3470, teacher: '郭', commissionPaid: 694, isFinished: false, notes: '赠送2节' },
  { id: '28', month: '12月', student: '刘雨笠', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 496, isFinished: false, notes: '全款' },
  { id: '29', month: '12月', student: '梁同学', course: '声乐', revenue: 500, teacher: '郭', commissionPaid: 0, isFinished: false, notes: '500定金未结' },
  { id: '30', month: '12月', student: '蟹同学', course: '声乐', revenue: 800, teacher: '郭', commissionPaid: 320, isFinished: true, notes: '800定金已结课' },
  { id: '31', month: '12月', student: '思思同学', course: '声乐+钢琴', revenue: 4880, teacher: '郭', commissionPaid: 1952, isFinished: true, notes: '已结课' },
  { id: '32', month: '1月', student: '小白同学', course: '声乐', revenue: 2480, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '徐老师待结' },
  { id: '33', month: '1月', student: '李虾仁同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
  { id: '34', month: '1月', student: '潘诚同学', course: '声乐', revenue: 300, teacher: '郭', commissionPaid: 120, isFinished: true, notes: '定金已结课' },
  { id: '35', month: '1月', student: '叶同学', course: '钢琴', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '全款' },
  { id: '36', month: '1月', student: '潘诚同学', course: '声乐', revenue: 2280, teacher: '郭', commissionPaid: 456, isFinished: false, notes: '全款' },
  { id: '37', month: '1月', student: '蟹同学', course: '声乐', revenue: 1680, teacher: '郭', commissionPaid: 336, isFinished: false, notes: '已结336' },
  { id: '38', month: '1月', student: '吴慧婷', course: '吉他初级', revenue: 2280, teacher: '郭', commissionPaid: 456, isFinished: false, notes: '全款' },
  { id: '39', month: '1月', student: '王津越', course: '钢琴初级', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '全款' },
  { id: '40', month: '1月', student: '王球', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 0, isFinished: false, notes: '黄老师未结' },
  { id: '41', month: '3月', student: '小爱同学', course: '吉他初级', revenue: 2480, teacher: '谷', commissionPaid: 0, isFinished: false, notes: '谷未结' },
  { id: '42', month: '3月', student: '余冠晓', course: '钢琴初转高', revenue: 2480, teacher: '黄', commissionPaid: 0, isFinished: false, notes: '待结' },
  { id: '43', month: '3月', student: '芦雅慧', course: '吉他正式课', revenue: 2480, teacher: '徐', commissionPaid: 0, is复inished: false, notes: '待结' },
  { id: '44', month: '3月', student: '杨同学', course: '声乐正式课', revenue: 2580, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '待结' },
  { id: '45', month: '3月', student: '林玉霞', course: '吉他正式课', revenue: 2480, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '待结' },
  { id: '46', month: '3月', student: '林玉霞', course: '声乐正式课', revenue: 1580, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '6节' },
  { id: '47', month: '3月', student: '李涵', course: '声乐吉他', revenue: 5060, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '待结' },
];

export default function App() {
  const fileInputRef = useRef(null);
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('全部');
  const [filterTeacher, setFilterTeacher] = useState('全部');
  const [filterCourseStatus, setFilterCourseStatus] = useState('全部');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ month: '3月', student: '', course: '', revenue: '', teacher: '', notes: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  // 1. 初始化数据库授权登录
  useEffect(() => {
    if (!auth) {
      setIsSyncing(false);
      return;
    }
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("数据库验证失败", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. 监听云端数据库数据变化
  useEffect(() => {
    if (!user || !db) return;
    setIsSyncing(true);
    
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'shanguyinyue_finances');
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push(doc.data()));
      docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(docs);
      setIsSyncing(false);
    }, (error) => {
      console.error("读取云端数据失败", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 业务逻辑：计算提成
  const processData = (rawData) => {
    return rawData.map(item => {
      const revenue = Number(item.revenue) || 0;
      const commissionPaid = Number(item.commissionPaid) || 0;
      const totalCommissionTarget = revenue * 0.4;
      const firstStageTarget = revenue * 0.2;
      const currentEarned = item.isFinished ? totalCommissionTarget : firstStageTarget;
      const currentPending = Math.max(0, currentEarned - commissionPaid);
      const futurePending = item.isFinished ? 0 : Math.max(0, totalCommissionTarget - Math.max(commissionPaid, firstStageTarget));

      return { ...item, totalCommissionTarget, currentEarned, currentPending, futurePending };
    });
  };

  const processedData = useMemo(() => processData(data), [data]);

  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchSearch = item.student.includes(searchTerm) || item.course.includes(searchTerm);
      const matchMonth = filterMonth === '全部' || item.month === filterMonth;
      const matchTeacher = filterTeacher === '全部' || item.teacher === filterTeacher;
      const matchCourseStatus = filterCourseStatus === '全部' 
        ? true 
        : filterCourseStatus === '已结课' ? item.isFinished : !item.isFinished;

      return matchSearch && matchMonth && matchTeacher && matchCourseStatus;
    });
  }, [processedData, searchTerm, filterMonth, filterTeacher, filterCourseStatus]);

  const metrics = useMemo(() => {
    let totalRevenue = 0, totalCurrentPending = 0, totalFuturePending = 0, totalPaid = 0;
    filteredData.forEach(item => {
      totalRevenue += Number(item.revenue);
      totalCurrentPending += item.currentPending;
      totalFuturePending += item.futurePending;
      totalPaid += Number(item.commissionPaid);
    });
    return { totalRevenue, totalCurrentPending, totalFuturePending, totalPaid };
  }, [filteredData]);

  const updateCloudRecord = async (id, updates) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'shanguyinyue_finances', id);
      await setDoc(docRef, updates, { merge: true });
    } catch (err) {
      console.error("云端更新失败", err);
      setAlertMessage("数据同步失败，请检查网络！");
    }
  };

  const handleToggleStatus = (id) => {
    const item = data.find(d => d.id === id);
    if(item) updateCloudRecord(id, { isFinished: !item.isFinished });
  };

  const handlePayPending = (id, amountToPay) => {
    const item = data.find(d => d.id === id);
    if(item) updateCloudRecord(id, { commissionPaid: Number(item.commissionPaid) + amountToPay });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) {
      setAlertMessage("等待数据库连接中，请稍后再试...");
      return;
    }
    const newItemId = Date.now().toString();
    const newItem = {
      ...newRecord,
      id: newItemId,
      revenue: Number(newRecord.revenue),
      commissionPaid: 0,
      isFinished: false,
      createdAt: Date.now()
    };
    
    setIsAddModalOpen(false);
    setNewRecord({ month: '3月', student: '', course: '', revenue: '', teacher: '', notes: '' });
    
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'shanguyinyue_finances', newItemId);
    await setDoc(docRef, newItem);
  };

  const handleDelete = (id) => setDeleteConfirmId(id);
  const confirmDelete = async () => {
    if (deleteConfirmId && user && db) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'shanguyinyue_finances', deleteConfirmId);
      await deleteDoc(docRef);
    }
    setDeleteConfirmId(null);
  };

  const injectDefaultDataToCloud = async () => {
    if (!user || !db) return;
    setAlertMessage('正在将原先的历史记录推送到云端数据库，大约需要5秒钟，请勿关闭页面...');
    try {
      let baseTime = Date.now() - 100000; 
      for (const item of defaultData) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'shanguyinyue_finances', item.id);
        await setDoc(docRef, { ...item, createdAt: baseTime + parseInt(item.id) });
      }
      setAlertMessage('旧账本同步成功！以后您可以和合伙人实时协同了！');
    } catch(e) {
      setAlertMessage('导入失败，请重试');
    }
  };

  const months = ['全部', ...new Set(data.map(item => item.month))];
  const teachers = ['全部', ...new Set(data.map(item => item.teacher))];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">山谷音乐财务系统 <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-1 rounded">协同分步提成版</span></h1>
            <div className="flex items-center mt-2 space-x-2">
              {isSyncing ? (
                <span className="flex items-center text-xs font-medium text-amber-500 bg-amber-50 px-2 py-1 rounded"><Loader2 size={12} className="animate-spin mr-1" /> 云端同步中...</span>
              ) : (
                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded"><Cloud size={12} className="mr-1" /> 已接入实时云端数据库</span>
              )}
              <span className="text-slate-500 text-xs">报名结算20% · 结课尾款20%</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm">
              <Plus size={16} className="mr-2" /> 新增账单
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center text-slate-500 mb-2">
              <DollarSign size={18} className="mr-1 text-emerald-500" />
              <span className="text-sm font-medium">总收学费 (当前筛选)</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¥{metrics.totalRevenue.toLocaleString()}</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center text-slate-500 mb-2">
              <Wallet size={18} className="mr-1 text-blue-500" />
              <span className="text-sm font-medium">已付老师总计</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¥{metrics.totalPaid.toLocaleString()}</h2>
          </div>

          <div className="bg-rose-50 rounded-2xl p-5 shadow-sm border border-rose-100 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-rose-100/50">
              <AlertCircle size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center text-rose-700 mb-2">
                <AlertCircle size={18} className="mr-1" />
                <span className="text-sm font-bold">当期急需结算</span>
              </div>
              <h2 className="text-2xl font-bold text-rose-700">¥{metrics.totalCurrentPending.toLocaleString()}</h2>
              <p className="text-xs text-rose-600 mt-1 opacity-80">当前欠老师的钱</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center text-slate-500 mb-2">
              <GraduationCap size={18} className="mr-1 text-purple-500" />
              <span className="text-sm font-medium">未来尾款预留</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-600">¥{metrics.totalFuturePending.toLocaleString()}</h2>
            <p className="text-xs text-slate-500 mt-1">结课后需支付的剩余20%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="搜索学生或课程..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{m === '全部' ? '全部月份' : m}</option>)}
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
            {teachers.map(t => <option key={t} value={t}>{t === '全部' ? '所有老师' : `${t}老师`}</option>)}
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" value={filterCourseStatus} onChange={(e) => setFilterCourseStatus(e.target.value)}>
            <option value="全部">全部课程进度</option>
            <option value="进行中">上课中 (仅结20%)</option>
            <option value="已结课">已结课 (可结40%)</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">基本信息</th>
                  <th className="px-4 py-3 font-semibold">实收(40%封顶)</th>
                  <th className="px-4 py-3 font-semibold">课程进度</th>
                  <th className="px-4 py-3 font-semibold">提成状态 (已付 / 应付)</th>
                  <th className="px-4 py-3 font-semibold text-rose-600">当期欠款</th>
                  <th className="px-4 py-3 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                
                {filteredData.length === 0 && !isSyncing && (
                  <tr>
                    <td colSpan="6" className="px-4 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Cloud size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-800 mb-2">云端数据库已建立，当前为空</h3>
                        <p className="text-sm mb-6 max-w-md">您和合伙人的专属云端工作区已准备就绪。您可以点击上方按钮手动新增第一笔账单，或者一键把历史的账本导入到云端。</p>
                        <button onClick={injectDefaultDataToCloud} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-xl transition-colors">
                          一键将历史账本推送到云端
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{row.student} <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">{row.month}</span></div>
                      <div className="text-xs text-slate-500 mt-1">{row.course} · <span className="text-indigo-600 font-medium">{row.teacher}老师</span></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">¥{row.revenue}</div>
                      <div className="text-xs text-slate-400 mt-1">总提¥{row.totalCommissionTarget}</div>
                    </td>
                    <td className="px-4 py-4">
                      {row.isFinished ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          <CheckCircle size={12} className="mr-1" /> 已结课
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          进行中 (首期)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${row.currentPending === 0 ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                            style={{ width: `${Math.min(100, (row.commissionPaid / row.currentEarned) * 100 || 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          ¥{row.commissionPaid} / <span className="text-slate-400">¥{row.currentEarned}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {row.currentPending > 0 ? (
                        <span className="font-bold text-rose-600">¥{row.currentPending}</span>
                      ) : (
                        <span className="text-emerald-600 text-xs font-medium">无欠款</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleToggleStatus(row.id)}
                        className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors border ${row.isFinished ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'}`}
                      >
                        {row.isFinished ? '撤销结课' : '标记结课'}
                      </button>
                      
                      {row.currentPending > 0 ? (
                        <button 
                          onClick={() => handlePayPending(row.id, row.currentPending)}
                          className="px-2.5 py-1.5 rounded text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                          发¥{row.currentPending}
                        </button>
                      ) : (
                         <button disabled className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed">
                          已结清
                        </button>
                      )}

                      <button 
                        onClick={() => handleDelete(row.id)}
                        className="px-2 py-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors inline-flex align-middle"
                        title="删除记录"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">新增账单记录</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">月份</label>
                  <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newRecord.month} onChange={e => setNewRecord({...newRecord, month: e.target.value})} placeholder="例: 4月" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">学生姓名</label>
                  <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newRecord.student} onChange={e => setNewRecord({...newRecord, student: e.target.value})} placeholder="输入姓名" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">课程名称</label>
                <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newRecord.course} onChange={e => setNewRecord({...newRecord, course: e.target.value})} placeholder="例: 钢琴初级" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">实收学费 (元)</label>
                  <input required type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={newRecord.revenue} onChange={e => setNewRecord({...newRecord, revenue: e.target.value})} placeholder="输入金额" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">负责老师</label>
                  <input required className="w-full px-3 py-2 border rounded-lg text-sm" value={newRecord.teacher} onChange={e => setNewRecord({...newRecord, teacher: e.target.value})} placeholder="例: 郭" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">备注说明</label>
                <input className="w-full px-3 py-2 border rounded-lg text-sm" value={newRecord.notes} onChange={e => setNewRecord({...newRecord, notes: e.target.value})} placeholder="选填" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium">取消</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium">存入云端数据库</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">确认删除</h3>
            <p className="text-sm text-slate-500 mb-6">您确定要在云端删除这条账单吗？合伙人那一端也会同步消失。</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium">取消</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-medium">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">系统提示</h3>
            <p className="text-sm text-slate-500 mb-6">{alertMessage}</p>
            <button onClick={() => setAlertMessage('')} className="w-full px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium">
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}