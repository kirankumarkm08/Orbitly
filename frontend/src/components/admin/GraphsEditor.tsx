'use client';

import { useEffect, useRef, useState } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

export default function GraphsEditor() {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100vh',
      width: 'auto',
      storageManager: false,
      panels: { defaults: [] },
      blockManager: {
        appendTo: '#blocks-container',
      },
    });

    editorRef.current = editor;

    const bm = editor.BlockManager;

    // Bar Chart Block
    bm.add('chart-bar', {
      label: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#3b82f6,#22c55e);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="8" width="4" height="13"/><rect x="17" y="4" width="4" height="17"/></svg>
        </div>
        <span style="font-size:11px;font-weight:500;color:#374151;">Bar Chart</span>
      </div>`,
      category: 'Charts',
      content: `
        <div class="chart-bar" style="padding: 40px; background: #ffffff; border-radius: 16px; font-family: 'Inter', sans-serif; max-width: 800px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Revenue Overview</h3>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">Monthly revenue breakdown</p>
          <div style="display: flex; align-items: flex-end; gap: 8px; height: 200px; padding: 0 8px;">
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 6px 6px 0 0; height: 35%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Jan</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 6px 6px 0 0; height: 55%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Feb</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 6px 6px 0 0; height: 42%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Mar</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 6px 6px 0 0; height: 68%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Apr</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 6px 6px 0 0; height: 50%;"></div>
              <span style="font-size: 11px; color: #6b7280;">May</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 6px 6px 0 0; height: 75%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Jun</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #22c55e, #16a34a); border-radius: 6px 6px 0 0; height: 62%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Jul</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #22c55e, #16a34a); border-radius: 6px 6px 0 0; height: 85%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Aug</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #22c55e, #16a34a); border-radius: 6px 6px 0 0; height: 70%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Sep</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #22c55e, #16a34a); border-radius: 6px 6px 0 0; height: 90%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Oct</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #8b5cf6, #7c3aed); border-radius: 6px 6px 0 0; height: 78%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Nov</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 100%; background: linear-gradient(180deg, #8b5cf6, #7c3aed); border-radius: 6px 6px 0 0; height: 95%;"></div>
              <span style="font-size: 11px; color: #6b7280;">Dec</span>
            </div>
          </div>
        </div>
      `,
    });

    // Line Chart Block
    bm.add('chart-line', {
      label: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <span style="font-size:11px;font-weight:500;color:#374151;">Line Chart</span>
      </div>`,
      category: 'Charts',
      content: `
        <div class="chart-line" style="padding: 40px; background: #ffffff; border-radius: 16px; font-family: 'Inter', sans-serif; max-width: 800px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Growth Trends</h3>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">User growth over time</p>
          <div style="position: relative; height: 200px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 20px 0;">
            <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 80 L8.3 70 L16.6 75 L25 50 L33.3 60 L41.6 45 L50 55 L58.3 40 L66.6 30 L75 35 L83.3 20 L91.6 15 L100 10 L100 100 L0 100 Z" fill="url(#lineGrad)"/>
              <path d="M0 80 L8.3 70 L16.6 75 L25 50 L33.3 60 L41.6 45 L50 55 L58.3 40 L66.6 30 L75 35 L83.3 20 L91.6 15 L100 10" fill="none" stroke="#f59e0b" stroke-width="2"/>
              <circle cx="0" cy="80" r="2" fill="#f59e0b"/>
              <circle cx="8.3" cy="70" r="2" fill="#f59e0b"/>
              <circle cx="16.6" cy="75" r="2" fill="#f59e0b"/>
              <circle cx="25" cy="50" r="2" fill="#f59e0b"/>
              <circle cx="33.3" cy="60" r="2" fill="#f59e0b"/>
              <circle cx="41.6" cy="45" r="2" fill="#f59e0b"/>
              <circle cx="50" cy="55" r="2" fill="#f59e0b"/>
              <circle cx="58.3" cy="40" r="2" fill="#f59e0b"/>
              <circle cx="66.6" cy="30" r="2" fill="#f59e0b"/>
              <circle cx="75" cy="35" r="2" fill="#f59e0b"/>
              <circle cx="83.3" cy="20" r="2" fill="#f59e0b"/>
              <circle cx="91.6" cy="15" r="2" fill="#f59e0b"/>
              <circle cx="100" cy="10" r="2" fill="#f59e0b"/>
            </svg>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0 8px;">
            <span style="font-size: 11px; color: #6b7280;">Jan</span>
            <span style="font-size: 11px; color: #6b7280;">Dec</span>
          </div>
        </div>
      `,
    });

    // Pie Chart Block
    bm.add('chart-pie', {
      label: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#8b5cf6,#ec4899);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
        <span style="font-size:11px;font-weight:500;color:#374151;">Pie Chart</span>
      </div>`,
      category: 'Charts',
      content: `
        <div class="chart-pie" style="padding: 40px; background: #ffffff; border-radius: 16px; font-family: 'Inter', sans-serif; max-width: 600px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Distribution</h3>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">Market share breakdown</p>
          <div style="display: flex; align-items: center; gap: 40px;">
            <div style="width: 180px; height: 180px; position: relative;">
              <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="20" stroke-dasharray="100.53 150.79" stroke-dashoffset="0"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" stroke-width="20" stroke-dasharray="75.4 150.79" stroke-dashoffset="-100.53"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" stroke-width="20" stroke-dasharray="50.26 150.79" stroke-dashoffset="-175.93"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" stroke-width="20" stroke-dasharray="25.13 150.79" stroke-dashoffset="-226.19"/>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">Product A</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">35%</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">Product B</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">25%</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">Product C</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">20%</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">Other</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">20%</span>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    // Area Chart Block
    bm.add('chart-area', {
      label: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#06b6d4,#0ea5e9);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 3v18h18"/><path d="M3 15l5-5 4 4 9-9"/></svg>
        </div>
        <span style="font-size:11px;font-weight:500;color:#374151;">Area Chart</span>
      </div>`,
      category: 'Charts',
      content: `
        <div class="chart-area" style="padding: 40px; background: #ffffff; border-radius: 16px; font-family: 'Inter', sans-serif; max-width: 800px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Traffic Overview</h3>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">Website traffic by source</p>
          <div style="position: relative; height: 200px; border-left: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 20px 0; background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%);">
            <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 90 L8 85 L16 88 L25 70 L33 75 L41 60 L50 65 L58 50 L66 45 L75 55 L83 35 L91 40 L100 20 L100 100 L0 100 Z" fill="url(#areaGrad)" stroke="none"/>
              <path d="M0 90 L8 85 L16 88 L25 70 L33 75 L41 60 L50 65 L58 50 L66 45 L75 55 L83 35 L91 40 L100 20" fill="none" stroke="#06b6d4" stroke-width="2"/>
              <defs>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0 8px;">
            <span style="font-size: 11px; color: #6b7280;">Jan</span>
            <span style="font-size: 11px; color: #6b7280;">Dec</span>
          </div>
        </div>
      `,
    });

    // Donut Chart Block
    bm.add('chart-donut', {
      label: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#ec4899,#f43f5e);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
        </div>
        <span style="font-size:11px;font-weight:500;color:#374151;">Donut Chart</span>
      </div>`,
      category: 'Charts',
      content: `
        <div class="chart-donut" style="padding: 40px; background: #ffffff; border-radius: 16px; font-family: 'Inter', sans-serif; max-width: 600px;">
          <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Budget Allocation</h3>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">Department budget distribution</p>
          <div style="display: flex; align-items: center; gap: 40px;">
            <div style="width: 180px; height: 180px; position: relative;">
              <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                <circle cx="50" cy="50" r="35" fill="none" stroke="#ec4899" stroke-width="12" stroke-dasharray="87.96 130.9" stroke-dashoffset="0"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="#8b5cf6" stroke-width="12" stroke-dasharray="65.97 130.9" stroke-dashoffset="-87.96"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="#06b6d4" stroke-width="12" stroke-dasharray="43.98 130.9" stroke-dashoffset="-153.93"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="#22c55e" stroke-width="12" stroke-dasharray="21.99 130.9" stroke-dashoffset="-197.91"/>
              </svg>
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #1f2937;">$2.4M</div>
                <div style="font-size: 12px; color: #6b7280;">Total</div>
              </div>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 12px; height: 12px; background: #ec4899; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">Marketing</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">35%</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 12px; height: 12px; background: #8b5cf6; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">Development</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">25%</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 12px; height: 12px; background: #06b6d4; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">Operations</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">20%</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 2px;"></div>
                <span style="font-size: 14px; color: #374151;">HR</span>
                <span style="font-size: 14px; color: #6b7280; margin-left: auto;">20%</span>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Blocks</h2>
          <p className="text-sm text-gray-500 mt-1">Drag charts to canvas</p>
        </div>
        <div id="blocks-container" className="flex-1 overflow-y-auto p-4" />
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Charts Editor</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Preview
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save
            </button>
          </div>
        </div>
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
}
