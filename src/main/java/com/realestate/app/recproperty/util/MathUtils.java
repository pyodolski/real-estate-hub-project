package com.realestate.app.recproperty.util;

public class MathUtils {
    public static double cosine(double[] a, double[] b) {
        double dot=0, na=0, nb=0;
        for (int i=0;i<a.length;i++) {
            dot += a[i]*b[i];
            na  += a[i]*a[i];
            nb  += b[i]*b[i];
        }
        return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-9);
    }
    public static double[] l2norm(double[] v) {
        double s=0; for (double x: v) s += x*x;
        double n = Math.sqrt(s) + 1e-9;
        for (int i=0;i<v.length;i++) v[i] /= n;
        return v;
    }
    public static double clamp(double v, double lo, double hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}