<?php
/* MOJAKS.CO API - penyimpanan JSON, login, pesanan, dan upload gambar (PHP 7.4+, cocok untuk InfinityFree) */
session_start();header('Content-Type: application/json; charset=utf-8');
$B=__DIR__;$D="$B/data/";
foreach(['data','assets/product','assets/payment'] as $d)if(!is_dir("$B/$d"))@mkdir("$B/$d",0755,true);
if(!is_file("$D.htaccess"))@file_put_contents("$D.htaccess","<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
function R($k,$d=[]){global $D;return is_file("$D$k.json")?json_decode(file_get_contents("$D$k.json"),true):$d;}
function W($k,$v){global $D;file_put_contents("$D$k.json",json_encode($v,JSON_UNESCAPED_UNICODE),LOCK_EX);}
function out($a){echo json_encode($a,JSON_UNESCAPED_UNICODE);exit;}
function err($m){out(['err'=>$m]);}
function DC(){$u='https://images.unsplash.com/photo-';$q='?q=80&w=1964&auto=format&fit=crop';return [['id'=>'men','name'=>'Men','desc'=>'Streetwear dan essentials untuk pria.','img'=>$u.'1488161628813-244aa2f8ceee'.$q,'on'=>true],['id'=>'women','name'=>'Women','desc'=>'Koleksi urban yang nyaman dan penuh karakter.','img'=>$u.'1494790108377-be9c29b29330'.$q,'on'=>true],['id'=>'kids','name'=>'Kids','desc'=>'Nyaman, tahan main, tetap keren.','img'=>$u.'1514090458221-65bb69cf63e6'.$q,'on'=>true]];}
function DA(){return [['id'=>'n1','text'=>'FREE SHIPPING untuk pesanan di atas Rp 500.000','link'=>'','on'=>true],['id'=>'n2','text'=>'Koleksi terbaru MOJAKS.CO sudah tersedia','link'=>'category.html?c=all','on'=>true]];}

/* Data awal. GANTI password admin lewat menu Settings setelah login pertama. */
if(!is_file("{$D}users.json")){
 W('users',[['id'=>'a1','name'=>'Administrator','email'=>'admin@mojaks.co','pw'=>password_hash('admin123',PASSWORD_DEFAULT),'role'=>'admin','joined'=>date('Y-m-d')]]);
 $P=[['MOJAKS.CO Oversize Tee Black',199000,0,'Men',30,'1576566588028-4147f3842f27'],['Denim Jacket Urban Series',449000,0,'Men',15,'1591047139829-d91aecb6caea'],['Leather Jacket Premium',899000,0,'Women',8,'1551028711-0305da6305a2'],['Basic Logo Tee White',139300,199000,'Kids',40,'1503342217505-b0a15ec3261c']];
 W('products',array_map(fn($p,$i)=>['id'=>(string)($i+1),'name'=>$p[0],'price'=>$p[1],'old'=>$p[2],'cat'=>$p[3],'stock'=>$p[4],'img'=>"https://images.unsplash.com/photo-{$p[5]}?q=80&w=600&auto=format&fit=crop"],$P,array_keys($P)));
 W('orders',[]);W('cfg',['fee'=>20000,'free'=>500000]);
 W('pay',[['id'=>'p1','name'=>'Transfer Bank BCA','no'=>'1234567890','holder'=>'MOJAKS.CO','note'=>'Transfer sesuai total pesanan, lalu upload bukti.','qr'=>'','on'=>true]]);
}

function me(){foreach(R('users') as $u)if($u['id']==($_SESSION['u']??'')&&empty($u['blocked']))return $u;return null;}
function st(){
 $m=me();$s=['products'=>R('products'),'cfg'=>R('cfg'),'pay'=>[],'me'=>null,'orders'=>[],'users'=>[],'cats'=>R('cats',DC()),'ann'=>R('ann',DA())];
 if(!$m||$m['role']!='admin'){$s['cats']=array_values(array_filter($s['cats'],fn($c)=>$c['on']));$s['ann']=array_values(array_filter($s['ann'],fn($a)=>$a['on']));}
 if($m){
  $o=R('orders');unset($m['pw']);$s['me']=$m;
  if($m['role']=='admin'){$s['pay']=R('pay');$s['orders']=$o;$s['users']=array_map(fn($x)=>array_diff_key($x,['pw'=>1]),R('users'));}
  else{$s['pay']=array_values(array_filter(R('pay'),fn($p)=>$p['on']));$s['orders']=array_values(array_filter($o,fn($x)=>$x['uid']==$m['id']));}
 }
 return $s;
}

$a=$_GET['a']??'get';$m=me();$adm=$m&&$m['role']=='admin';
if($_SERVER['REQUEST_METHOD']=='POST'&&!isset($_SERVER['HTTP_X_R']))err('Bad request');
$b=json_decode(file_get_contents('php://input'),true)?:[];
$STS=['Unpaid','Verifying','Paid','Shipped','Delivered','Cancelled'];

switch($a){
 case 'get':out(['d'=>st()]);
 case 'login':
  foreach(R('users') as $u)if($u['email']==strtolower(trim($b['email']??''))&&password_verify($b['pw']??'',$u['pw'])){
   if(!empty($u['blocked']))err('Akun diblokir oleh admin');
   $_SESSION['u']=$u['id'];out(['d'=>st()]);
  }
  err('Email atau password salah');
 case 'register':
  $e=strtolower(trim($b['email']??''));$n=trim($b['name']??'');
  if(!filter_var($e,FILTER_VALIDATE_EMAIL)||$n===''||strlen($b['pw']??'')<6)err('Data tidak valid (password minimal 6 karakter)');
  $U=R('users');foreach($U as $u)if($u['email']==$e)err('Email sudah terdaftar');
  $id=uniqid('u');$U[]=['id'=>$id,'name'=>$n,'email'=>$e,'pw'=>password_hash($b['pw'],PASSWORD_DEFAULT),'role'=>'user','phone'=>'','addr'=>'','joined'=>date('Y-m-d')];
  W('users',$U);$_SESSION['u']=$id;out(['d'=>st()]);
 case 'logout':$_SESSION=[];session_destroy();out(['d'=>st()]);
 case 'put': /* admin: products, cfg, pay, users(blocked) */
  if(!$adm)err('Akses ditolak');$k=$b['k']??'';if(!is_array($b['v']??null))err('Data tidak valid');
  if(in_array($k,['products','cfg','pay','cats','ann']))W($k,$b['v']);
  elseif($k=='users'){$U=R('users');foreach($U as &$u)foreach($b['v'] as $x)if($x['id']==$u['id']&&$u['role']!='admin')$u['blocked']=!empty($x['blocked']);unset($u);W('users',$U);}
  out(['d'=>st()]);
 case 'order': /* harga & stok dihitung server */
  if(!$m||$m['role']!='user')err('Login sebagai user dulu');
  $pay=null;foreach(R('pay') as $p)if($p['id']==($b['pay']??'')&&$p['on'])$pay=$p;
  if(!$pay)err('Pilih metode pembayaran');if(trim($m['addr']??'')==='')err('Isi alamat pengiriman di Profile dulu');
  $P=R('products');$c=R('cfg');$it=[];$sub=0;
  foreach($b['cart']??[] as $i){
   foreach($P as &$p)if($p['id']==$i['id']){
    $q=max(1,(int)$i['quantity']);if($p['stock']<$q)err("Stok {$p['name']} tidak cukup");
    $p['stock']-=$q;$sub+=$p['price']*$q;$it[]=['id'=>$p['id'],'name'=>$p['name'],'price'=>$p['price'],'q'=>$q];
   }
   unset($p);
  }
  if(!$it)err('Keranjang kosong');
  $ship=$sub>=$c['free']?0:$c['fee'];$O=R('orders');
  array_unshift($O,['id'=>'ORD-'.strtoupper(substr(uniqid(),-6)),'uid'=>$m['id'],'name'=>$m['name'],'addr'=>$m['addr'],'items'=>$it,'sub'=>$sub,'ship'=>$ship,'total'=>$sub+$ship,'status'=>'Unpaid','date'=>date('Y-m-d H:i'),'pay'=>$pay['name'],'proof'=>'']);
  W('products',$P);W('orders',$O);out(['d'=>st()]);
 case 'ost': /* ubah status pesanan */
  if(!$m)err('Login dulu');$s=$b['st']??'';if(!in_array($s,$STS))err('Status tidak valid');
  $O=R('orders');
  foreach($O as &$o)if($o['id']==($b['id']??'')){
   if($o['status']=='Cancelled')err('Pesanan sudah dibatalkan');
   if(!$adm&&!($o['uid']==$m['id']&&(($s=='Cancelled'&&in_array($o['status'],['Unpaid','Verifying']))||($s=='Delivered'&&$o['status']=='Shipped'))))err('Tidak diizinkan');
   if($s=='Cancelled'){$P=R('products');foreach($o['items'] as $i)foreach($P as &$p)if($p['id']==$i['id'])$p['stock']+=$i['q'];unset($p);W('products',$P);}
   $o['status']=$s;W('orders',$O);out(['d'=>st()]);
  }
  err('Pesanan tidak ditemukan');
 case 'up': case 'proof': /* upload gambar: up=admin (produk/QR), proof=bukti bayar user */
  if(!$m)err('Login dulu');if($a=='up'&&!$adm)err('Akses ditolak');
  $f=$_FILES['f']??null;if(!$f||$f['error']||$f['size']>2097152)err('Upload gagal (maks. 2 MB)');
  $i=@getimagesize($f['tmp_name']);$ext=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$i['mime']??'']??null;
  if(!$ext)err('Format harus JPG, PNG, atau WEBP');
  $dir=($a=='proof'||($_POST['t']??'')=='qr')?'payment':'product';
  $name=$dir[0].bin2hex(random_bytes(6)).".$ext";
  if(!move_uploaded_file($f['tmp_name'],"$B/assets/$dir/$name"))err('Gagal menyimpan file, cek izin folder assets');
  $path="assets/$dir/$name";if($a=='up')out(['path'=>$path]);
  $O=R('orders');
  foreach($O as &$o)if($o['id']==($_POST['oid']??'')&&$o['uid']==$m['id']&&in_array($o['status'],['Unpaid','Verifying'])){
   $o['proof']=$path;$o['status']='Verifying';W('orders',$O);out(['d'=>st()]);
  }
  err('Pesanan tidak valid');
 case 'prof':
  if(!$m)err('Login dulu');$U=R('users');
  foreach($U as &$u)if($u['id']==$m['id'])foreach(['name','phone','addr'] as $k)if(isset($b[$k]))$u[$k]=trim($b[$k]);
  unset($u);W('users',$U);out(['d'=>st()]);
 case 'pw':
  if(!$m)err('Login dulu');$U=R('users');
  foreach($U as &$u)if($u['id']==$m['id']){
   if(!password_verify($b['old']??'',$u['pw']))err('Password lama salah');
   if(strlen($b['nw']??'')<6)err('Minimal 6 karakter');
   $u['pw']=password_hash($b['nw'],PASSWORD_DEFAULT);
  }
  unset($u);W('users',$U);out(['d'=>st()]);
}
err('Aksi tidak dikenal');
